"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { getRazorpayClient, verifyRazorpaySignature } from "@/lib/razorpay";
import { calculateAuthoritativeOrder } from "@/lib/order-pricing";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { checkoutRateLimiter, checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendOrderPlacedEmail,
  sendAdminOrderAlertEmail,
  sendOrderFailureAlertEmail,
} from "@/lib/email";
import type { CartItem } from "@/types";

export interface CreateRazorpayOrderPayload {
  formData: CheckoutFormData;
  items: CartItem[];
}

export interface CreateRazorpayOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

export interface VerifyRazorpayOrderPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  formData: CheckoutFormData;
  items: CartItem[];
}

export interface VerifyRazorpayOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  // 32 unambiguous characters (excludes 0, 1, I, O to prevent confusion on invoices)
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += characters.charAt(crypto.randomInt(0, characters.length));
  }
  return `AA-${year}-${suffix}`;
}

/**
 * Server action to initiate a Razorpay order.
 * Calculates authoritative cart totals and creates an order on Razorpay's servers.
 */
export async function createRazorpayOrder(
  payload: CreateRazorpayOrderPayload
): Promise<CreateRazorpayOrderResult> {
  try {
    // 1. IP Rate Limiting check
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const rateLimit = await checkRateLimit(checkoutRateLimiter, clientIp);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many attempts. Please wait a few minutes before trying again.",
      };
    }

    const { formData, items } = payload;

    // 2. Validate form details
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid order information.";
      return { success: false, error: firstError };
    }

    // 3. Authoritative calculation from DB
    const calc = await calculateAuthoritativeOrder(items);
    if (!calc.success) {
      return { success: false, error: calc.error || "Unable to calculate order total." };
    }

    if (calc.totalAmount <= 0) {
      return { success: false, error: "Invalid order total amount." };
    }

    // 4. Create order via Razorpay SDK
    const razorpay = getRazorpayClient();
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${crypto.randomBytes(2).toString("hex")}`;

    const validData = parsed.data;
    const rzpOrder = await razorpay.orders.create({
      amount: calc.totalAmount, // in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        customer_name: validData.customerName,
        customer_email: validData.customerEmail,
        customer_phone: validData.customerPhone,
      },
    });

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      return { success: false, error: "Razorpay Public Key ID is not configured." };
    }

    const shippingAddressJson = {
      street: validData.street,
      landmark: validData.landmark || "",
      city: validData.city,
      state: validData.state,
      pincode: validData.pincode,
      country: validData.country || "India",
    };

    const supabase = createAdminClient();

    // 5. Insert pending order record so webhooks and redirect callbacks have a shared safety net
    let orderData: { id: string; order_number: string } | null = null;
    let orderError: any = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const orderNumber = generateOrderNumber();

      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: validData.customerName,
          customer_email: validData.customerEmail,
          customer_phone: validData.customerPhone,
          country_code: validData.countryCode || "+91",
          shipping_address: shippingAddressJson,
          delivery_instructions: validData.deliveryInstructions || null,
          subtotal: calc.subtotal,
          delivery_charge: calc.deliveryCharge,
          discount_amount: calc.discountAmount,
          total_amount: calc.totalAmount,
          currency: "INR",
          payment_method: "razorpay",
          payment_status: "pending",
          gateway_order_id: rzpOrder.id,
          order_status: "received",
        })
        .select("id, order_number")
        .single();

      if (!error && data) {
        orderData = data;
        orderError = null;
        break;
      }

      if (error?.code === "23505") {
        console.warn(`[createRazorpayOrder] Collision on ${orderNumber}, retrying...`);
        orderError = error;
        continue;
      }

      orderError = error;
      break;
    }

    if (orderError || !orderData) {
      console.error("[createRazorpayOrder] Failed to create pending order record:", orderError);
      return {
        success: false,
        error: "Failed to initialize order record. Please try again.",
      };
    }

    // Insert order items
    const itemsPayload = calc.orderItemsToInsert.map((item) => ({
      ...item,
      order_id: orderData!.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsError) {
      console.error("[createRazorpayOrder] Error inserting order items:", itemsError);
    }

    return {
      success: true,
      orderId: rzpOrder.id,
      orderNumber: orderData.order_number,
      amount: calc.totalAmount,
      currency: "INR",
      keyId,
    };
  } catch (err: unknown) {
    console.error("[createRazorpayOrder] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to initiate Razorpay checkout.",
    };
  }
}

/**
 * Server action to cryptographically verify Razorpay payment and record the order.
 */
export async function verifyAndCompleteRazorpayOrder(
  payload: VerifyRazorpayOrderPayload
): Promise<VerifyRazorpayOrderResult> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, formData, items } = payload;

  try {
    // 1. Verify HMAC SHA-256 signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      console.error("[verifyAndCompleteRazorpayOrder] Invalid Razorpay signature", {
        razorpayOrderId,
        razorpayPaymentId,
      });

      sendOrderFailureAlertEmail({
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        country_code: formData.countryCode,
        error_message: "Razorpay signature verification failed (possible tampering attempt).",
        payment_method: "razorpay",
        items_summary: items.map((i) => `${i.title} x${i.quantity}`).join(", "),
      }).catch((e) => console.error("[verifyAndCompleteRazorpayOrder] Alert error:", e));

      return {
        success: false,
        error: "Payment verification failed. Please contact gallery support if amount was debited.",
      };
    }

    // 2. Validate form details
    const parsed = checkoutSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Invalid order information provided." };
    }
    const validData = parsed.data;

    // 3. Authoritative DB calculation
    const calc = await calculateAuthoritativeOrder(items);
    if (!calc.success) {
      return { success: false, error: calc.error || "Unable to verify order pricing." };
    }

    const shippingAddressJson = {
      street: validData.street,
      landmark: validData.landmark || "",
      city: validData.city,
      state: validData.state,
      pincode: validData.pincode,
      country: validData.country || "India",
    };

    const supabase = createAdminClient();

    // 4. Look up existing pending order record created by createRazorpayOrder
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, order_number, payment_status")
      .eq("gateway_order_id", razorpayOrderId)
      .maybeSingle();

    let orderData: { id: string; order_number: string } | null = null;

    if (existingOrder) {
      orderData = { id: existingOrder.id, order_number: existingOrder.order_number };

      // If webhook already marked this order as paid, return success immediately without duplicate emails
      if (existingOrder.payment_status === "paid") {
        return {
          success: true,
          orderNumber: existingOrder.order_number,
          orderId: existingOrder.id,
        };
      }

      // Update existing pending order to paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_reference: razorpayPaymentId,
          paid_at: new Date().toISOString(),
          order_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingOrder.id);

      if (updateError) {
        console.error("[verifyAndCompleteRazorpayOrder] Error updating existing order:", updateError);
      }
    } else {
      // Fallback: If no pending order exists (edge case resilience), insert new order
      let orderError: any = null;
      const maxAttempts = 5;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const orderNumber = generateOrderNumber();

        const { data, error } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_name: validData.customerName,
            customer_email: validData.customerEmail,
            customer_phone: validData.customerPhone,
            country_code: validData.countryCode || "+91",
            shipping_address: shippingAddressJson,
            delivery_instructions: validData.deliveryInstructions || null,
            subtotal: calc.subtotal,
            delivery_charge: calc.deliveryCharge,
            discount_amount: calc.discountAmount,
            total_amount: calc.totalAmount,
            currency: "INR",
            payment_method: "razorpay",
            payment_status: "paid",
            payment_reference: razorpayPaymentId,
            gateway_order_id: razorpayOrderId,
            paid_at: new Date().toISOString(),
            order_status: "confirmed",
            admin_notes: null,
          })
          .select("id, order_number")
          .single();

        if (!error && data) {
          orderData = data;
          orderError = null;
          break;
        }

        if (error?.code === "23505") {
          console.warn(`[verifyAndCompleteRazorpayOrder] Collision on ${orderNumber}, retrying...`);
          orderError = error;
          continue;
        }

        orderError = error;
        break;
      }

      if (orderError || !orderData) {
        console.error("[verifyAndCompleteRazorpayOrder] DB insert order error:", orderError);

        sendOrderFailureAlertEmail({
          customer_name: validData.customerName,
          customer_email: validData.customerEmail,
          customer_phone: validData.customerPhone,
          country_code: validData.countryCode,
          error_message: `Razorpay payment ${razorpayPaymentId} succeeded but order DB insertion failed.`,
          total_amount: calc.totalAmount,
          payment_method: "razorpay",
          items_summary: items.map((i) => `${i.title} x${i.quantity}`).join(", "),
        }).catch((e) => console.error("[verifyAndCompleteRazorpayOrder] Failure alert error:", e));

        return {
          success: false,
          error: "Your payment succeeded but we encountered an issue creating your order record. Our gallery team has been alerted immediately.",
        };
      }

      // Insert order items for fallback
      const itemsPayload = calc.orderItemsToInsert.map((item) => ({
        ...item,
        order_id: orderData!.id,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsError) {
        console.error("[verifyAndCompleteRazorpayOrder] Error inserting order items:", itemsError);
      }
    }

    // 6. Atomically decrement ready stock for ordered variants (down to 0, never negative)
    for (const item of calc.orderItemsToInsert) {
      if (item.variant_id) {
        supabase
          .rpc("decrement_variant_stock", {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          })
          .then(({ error }: { error: any }) => {
            if (error) {
              console.error("[verifyAndCompleteRazorpayOrder] Error decrementing stock for variant:", item.variant_id, error);
            }
          });
      }
    }

    // 7. Dispatch emails asynchronously
    const emailOrderData = {
      order_id: orderData.id,
      order_number: orderData.order_number,
      customer_name: validData.customerName,
      customer_email: validData.customerEmail,
      customer_phone: validData.customerPhone,
      country_code: validData.countryCode || "+91",
      total_amount: calc.totalAmount,
      payment_method: "razorpay",
      payment_status: "paid",
      payment_reference: razorpayPaymentId,
      receipt_url: null,
      delivery_instructions: validData.deliveryInstructions || null,
      shipping_address: shippingAddressJson,
      items: calc.orderItemsToInsert.map((i) => ({
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
    ]).catch((err) => console.error("[verifyAndCompleteRazorpayOrder] Email dispatch error:", err));

    return {
      success: true,
      orderNumber: orderData.order_number,
      orderId: orderData.id,
    };
  } catch (err: unknown) {
    console.error("[verifyAndCompleteRazorpayOrder] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred finalizing your payment.",
    };
  }
}

