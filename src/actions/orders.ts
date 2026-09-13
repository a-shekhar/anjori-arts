"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { uploadStream } from "@/lib/cloudinary-server";
import {
  sendOrderPlacedEmail,
  sendAdminOrderAlertEmail,
  sendOrderFailureAlertEmail,
} from "@/lib/email";
import { checkoutRateLimiter, checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { calculateAuthoritativeOrder } from "@/lib/order-pricing";
import type { Order, OrderItem, CartItem, CustomOrder } from "@/types";

import { generateReferenceCode } from "@/lib/reference";

export interface CreateOrderPayload {
  formData: CheckoutFormData;
  items: CartItem[];
}

export interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}

function generateOrderNumber(): string {
  return generateReferenceCode("ART");
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  try {
    // 0. Rate limiting by client IP
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const rateLimit = await checkRateLimit(checkoutRateLimiter, clientIp);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many order attempts from your device. Please wait a few minutes before trying again.",
      };
    }

    const { formData, items } = payload;

    if (!items || items.length === 0) {
      return { success: false, error: "Your shopping bag is empty." };
    }

    // Validate form details
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid order information provided.";
      return { success: false, error: firstError };
    }

    const validData = parsed.data;

    // Reject Razorpay orders: they must be initiated via createRazorpayOrder and cryptographically verified
    if (validData.paymentMethod === "razorpay") {
      return {
        success: false,
        error: "Razorpay orders must be processed through the secure payment gateway.",
      };
    }

    // Require proof of payment for UPI orders to prevent malicious stock blocking
    if (validData.paymentMethod === "upi_qr") {
      const ref = validData.paymentReference?.trim();
      const hasReceipt = Boolean(validData.receiptUrl?.trim());
      if (!ref && !hasReceipt) {
        return {
          success: false,
          error: "Please provide a valid UPI Reference / UTR number or upload your payment screenshot to place your order.",
        };
      }
    }

    // 1. Authoritative DB calculation & stock verification
    const calc = await calculateAuthoritativeOrder(items);
    if (!calc.success) {
      return { success: false, error: calc.error || "Unable to calculate order total." };
    }

    const { subtotal, deliveryCharge, discountAmount, totalAmount, orderItemsToInsert } = calc;
    const supabase = createAdminClient();

    // Determine initial payment status for manual/offline orders
    let paymentStatus = "pending";
    if (validData.receiptUrl || validData.paymentReference) {
      paymentStatus = "receipt_uploaded";
    }

    const shippingAddressJson = {
      street: validData.street,
      landmark: validData.landmark || "",
      city: validData.city,
      state: validData.state,
      pincode: validData.pincode,
      country: validData.country || "India",
    };

    // Optional: Attach user_id if customer is logged in
    let authUserId: string | null = null;
    try {
      const userSupabase = await createClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        authUserId = user.id;
      }
    } catch {
      // Guest order
    }

    // 1. Insert order (with automatic retry on unique constraint collision)
    let orderData: { id: string; order_number: string } | null = null;
    let orderError: { code?: string; message?: string } | null = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const orderNumber = generateOrderNumber();

      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: authUserId,
          customer_name: validData.customerName,
          customer_email: validData.customerEmail,
          customer_phone: validData.customerPhone,
          country_code: validData.countryCode || "+91",
          shipping_address: shippingAddressJson,
          delivery_instructions: validData.deliveryInstructions || null,
          subtotal,
          delivery_charge: deliveryCharge,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          currency: "INR",
          payment_method: validData.paymentMethod,
          payment_status: paymentStatus,
          payment_reference: validData.paymentReference || null,
          receipt_url: validData.receiptUrl || null,
          order_status: "received",
        })
        .select("id, order_number")
        .single();

      if (!error && data) {
        orderData = data;
        orderError = null;
        break;
      }

      // If unique constraint violation on order_number (Postgres error 23505), retry with a new order number
      if (error?.code === "23505") {
        console.warn(
          `[createOrder] Collision on order_number ${orderNumber}, retrying (attempt ${attempt + 1}/${maxAttempts})...`
        );
        orderError = error;
        continue;
      }

      // Non-collision error: break immediately
      orderError = error;
      break;
    }

    if (orderError || !orderData) {
      console.error("[createOrder] Error inserting order:", orderError);
      console.error("[createOrder] Error inserting order after attempts:", orderError);

      sendOrderFailureAlertEmail({
        customer_name: validData.customerName,
        customer_email: validData.customerEmail,
        customer_phone: validData.customerPhone,
        country_code: validData.countryCode,
        error_message: orderError?.message || "Failed to insert order record into database.",
        total_amount: totalAmount,
        payment_method: validData.paymentMethod,
        items_summary: items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(", "),
      }).catch((e) => console.error("[createOrder] Failure alert dispatch error:", e));

      return { success: false, error: "Failed to process order. Please try again or contact support." };
    }

    // 2. Insert order items
    const itemsPayload = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("[createOrder] Error inserting order items:", itemsError);
      // Non-fatal if order succeeded, but log it
    }

    // Atomically decrement ready stock for ordered variants (down to 0, never negative)
    // Only decrement immediately for prepaid orders (Razorpay, UPI QR).
    // For pay_on_dispatch (Framing Consultation requests), stock is not decremented until the gallery manager confirms the order and collects the 50% advance.
    if (validData.paymentMethod !== "pay_on_dispatch") {
      for (const item of orderItemsToInsert) {
        if (item.variant_id) {
          supabase
            .rpc("decrement_variant_stock", {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity,
            })
            .then(({ error }: { error: unknown }) => {
              if (error) {
                console.error("[createOrder] Error decrementing stock for variant:", item.variant_id, error);
              }
            });
        }
      }
    }

    // 2b. Clear cloud cart if user was authenticated
    if (authUserId) {
      supabase
        .from("cart_items")
        .delete()
        .eq("user_id", authUserId)
        .then(({ error }: { error: unknown }) => {
          if (error) {
            console.warn("[createOrder] Notice clearing cloud cart for user:", authUserId, error);
          }
        });
    }

    // 3. Dispatch emails asynchronously: Customer confirmation (BCC'd to Anjori Arts) + Dedicated Admin Alert
    const emailOrderData = {
      order_id: orderData.id,
      order_number: orderData.order_number,
      customer_name: validData.customerName,
      customer_email: validData.customerEmail,
      customer_phone: validData.customerPhone,
      country_code: validData.countryCode || "+91",
      total_amount: totalAmount,
      payment_method: validData.paymentMethod,
      payment_status: paymentStatus,
      payment_reference: validData.paymentReference || null,
      receipt_url: validData.receiptUrl || null,
      delivery_instructions: validData.deliveryInstructions || null,
      shipping_address: shippingAddressJson,
      items: orderItemsToInsert.map((i) => ({
        title: i.title,
        size: i.size,
        is_framed: i.is_framed,
        quantity: i.quantity,
        unit_price: i.unit_price + i.framing_price,
      })),
    };

    Promise.allSettled([
      sendOrderPlacedEmail(emailOrderData),
      sendAdminOrderAlertEmail(emailOrderData),
    ]).catch((err) => console.error("[createOrder] Email dispatch error:", err));

    return {
      success: true,
      orderNumber: orderData.order_number,
      orderId: orderData.id,
    };
  } catch (err: unknown) {
    console.error("[createOrder] Unexpected error:", err);

    sendOrderFailureAlertEmail({
      customer_name: payload.formData?.customerName,
      customer_email: payload.formData?.customerEmail,
      customer_phone: payload.formData?.customerPhone,
      country_code: payload.formData?.countryCode,
      error_message: err instanceof Error ? err.message : "Unexpected checkout exception",
      items_summary: payload.items?.map((i) => `${i.title} x${i.quantity}`).join(", "),
    }).catch((e) => console.error("[createOrder] Failure alert dispatch error:", e));

    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while placing order.",
    };
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError || !order) {
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("[getOrderByNumber] Error fetching order items:", itemsError);
    }

    return {
      ...order,
      items: (items || []) as OrderItem[],
    } as Order;
  } catch (err) {
    console.error("[getOrderByNumber] Unexpected error:", err);
    return null;
  }
}

export async function uploadPaymentReceipt(
  orderNumber: string,
  formData: FormData
): Promise<{ success: boolean; receiptUrl?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No receipt file selected." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Please upload an image file (JPG, PNG, or WebP)." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = "anjori-arts/orders/receipts";
    const uploadResult = await uploadStream(buffer, folder);

    if (!uploadResult || !uploadResult.secureUrl) {
      return { success: false, error: "Failed to upload image. Please try again." };
    }

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        receipt_url: uploadResult.secureUrl,
        payment_status: "receipt_uploaded",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    if (updateError) {
      console.error("[uploadPaymentReceipt] Error updating order:", updateError);
      return { success: false, error: "Failed to associate receipt with order." };
    }

    return { success: true, receiptUrl: uploadResult.secureUrl };
  } catch (err: unknown) {
    console.error("[uploadPaymentReceipt] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error uploading receipt.",
    };
  }
}

export async function getUserOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Auto-claim historical guest orders matching the authenticated user's email
    if (user.email) {
      try {
        const adminDb = createAdminClient();
        await adminDb
          .from("orders")
          .update({ user_id: user.id })
          .is("user_id", null)
          .ilike("customer_email", user.email);
      } catch (claimErr) {
        console.warn("[getUserOrders] Notice auto-claiming guest orders:", claimErr);
      }
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersError || !orders) {
      console.error("[getUserOrders] Error fetching user orders:", ordersError);
      return [];
    }

    if (orders.length === 0) {
      return [];
    }

    const orderIds = orders.map((o) => o.id);
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("[getUserOrders] Error fetching user order items:", itemsError);
    }

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of (items || []) as OrderItem[]) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) || [],
    })) as Order[];
  } catch (err) {
    console.error("[getUserOrders] Unexpected error:", err);
    return [];
  }
}

export async function getUserCustomOrders(): Promise<CustomOrder[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Auto-claim historical guest custom orders matching the authenticated user's email
    if (user.email) {
      try {
        const adminDb = createAdminClient();
        await adminDb
          .from("custom_orders")
          .update({ user_id: user.id })
          .is("user_id", null)
          .ilike("email", user.email);
      } catch (claimErr) {
        console.warn("[getUserCustomOrders] Notice auto-claiming guest custom orders:", claimErr);
      }
    }

    // Query under standard RLS: auth.uid() = user_id
    const { data: customOrders, error: customOrdersError } = await supabase
      .from("custom_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (customOrdersError || !customOrders) {
      console.error("[getUserCustomOrders] Error fetching custom orders:", customOrdersError);
      return [];
    }

    return customOrders as CustomOrder[];
  } catch (err) {
    console.error("[getUserCustomOrders] Unexpected error:", err);
    return [];
  }
}

