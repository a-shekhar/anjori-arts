"use server";

 
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { uploadStream } from "@/lib/cloudinary-server";
import {
  sendOrderPlacedEmail,
  sendAdminOrderAlertEmail,
  sendOrderFailureAlertEmail,
} from "@/lib/email";
import { DELIVERY_CHARGE } from "@/config/constants";
import type { Order, OrderItem, CartItem } from "@/types";

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
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `AA-${year}-${randomSuffix}`;
  // 32 unambiguous characters (excludes 0, 1, I, O to prevent confusion on invoices)
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += characters.charAt(crypto.randomInt(0, characters.length));
  }
  return `AA-${year}-${suffix}`;
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  try {
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
    const supabase = createAdminClient();

    // 1. Collect candidate variant IDs for authoritative DB price lookup
    const isUuid = (val?: string | null): val is string =>
      typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

    const candidateVariantIds = Array.from(
      new Set(items.map((i) => i.variantId).filter(isUuid))
    );

    // 2. Fetch authoritative variants from Supabase
    interface DbVariantRecord {
      id: string;
      artwork_id: string;
      label: string;
      selling_price: number;
      mrp: number;
      stock_quantity: number;
      is_active: boolean;
      can_be_framed: boolean;
      framing_price: number;
      sku: string | null;
      artwork: {
        id: string;
        title: string;
        price: number;
        is_available: boolean;
        images: Array<{ url: string; alt?: string }> | null;
      } | Array<{
        id: string;
        title: string;
        price: number;
        is_available: boolean;
        images: Array<{ url: string; alt?: string }> | null;
      }> | null;
    }

    const variantMap = new Map<string, DbVariantRecord>();
    if (candidateVariantIds.length > 0) {
      const { data: dbVariants, error: variantsError } = await supabase
        .from("artwork_variants")
        .select(`
          id,
          artwork_id,
          label,
          selling_price,
          mrp,
          stock_quantity,
          is_active,
          can_be_framed,
          framing_price,
          sku,
          artwork:artworks(id, title, price, is_available, images)
        `)
        .in("id", candidateVariantIds);

      if (variantsError) {
        console.error("[createOrder] Error fetching artwork variants:", variantsError);
        return { success: false, error: "Unable to verify artwork pricing. Please try again." };
      }

      if (dbVariants) {
        for (const v of dbVariants) {
          variantMap.set(v.id, v as unknown as DbVariantRecord);
        }
      }
    }

    // 3. Fallback: Fetch direct artworks for any items where variantId was not in artwork_variants
    interface DbArtworkRecord {
      id: string;
      title: string;
      price: number;
      is_available: boolean;
      images: Array<{ url: string; alt?: string }> | null;
    }

    const missingArtworkIds = Array.from(
      new Set(
        items
          .filter((i) => !variantMap.has(i.variantId))
          .map((i) => i.artworkId || i.variantId)
          .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      )
    );

    const artworkMap = new Map<string, DbArtworkRecord>();
    if (missingArtworkIds.length > 0) {
      const { data: dbArtworks, error: artworksError } = await supabase
        .from("artworks")
        .select("id, title, price, is_available, images")
        .in("id", missingArtworkIds);

      if (artworksError) {
        console.error("[createOrder] Error fetching artworks:", artworksError);
        return { success: false, error: "Unable to verify artwork pricing. Please try again." };
      }

      if (dbArtworks) {
        for (const a of dbArtworks) {
          artworkMap.set(a.id, a as unknown as DbArtworkRecord);
        }
      }
    }

    // 4. Calculate totals authoritatively from database prices
    let subtotal = 0;
    const orderItemsToInsert: Array<{
      artwork_id: string | null;
      variant_id: string | null;
      title: string;
      image_url: string | null;
      size: string;
      is_framed: boolean;
      framing_price: number;
      unit_price: number;
      quantity: number;
      line_total: number;
    }> = [];

    for (const item of items) {
      const quantity = Math.max(1, Math.min(5, Math.floor(Number(item.quantity) || 1)));

      let unitPrice: number;
      let framingPrice = 0;
      let isFramed = false;
      let title = item.title;
      let imageUrl: string | null = item.imageUrl || null;
      let size = item.size || "Standard";
      let artworkId: string | null = null;
      let variantId: string | null = null;

      const variant = variantMap.get(item.variantId);

      if (variant) {
        const art = Array.isArray(variant.artwork) ? variant.artwork[0] : variant.artwork;

        if (variant.is_active === false) {
          return {
            success: false,
            error: `"${art?.title || item.title}" (${variant.label}) is currently unavailable.`,
          };
        }

        if (variant.stock_quantity === 0) {
          return {
            success: false,
            error: `"${art?.title || item.title}" (${variant.label}) is sold out.`,
          };
        }

        if (variant.stock_quantity > 0 && quantity > variant.stock_quantity) {
          return {
            success: false,
            error: `Only ${variant.stock_quantity} available for "${art?.title || item.title}" (${variant.label}).`,
          };
        }

        unitPrice = Number(variant.selling_price);
        if (item.isFramed && variant.can_be_framed) {
          isFramed = true;
          framingPrice = Number(variant.framing_price) || 0;
        } else {
          isFramed = false;
          framingPrice = 0;
        }

        artworkId = variant.artwork_id || art?.id || item.artworkId || null;
        variantId = variant.id;
        size = variant.label;
        title = art?.title || item.title;

        const artworkImages = art?.images;
        if (Array.isArray(artworkImages) && artworkImages.length > 0 && artworkImages[0]?.url) {
          imageUrl = artworkImages[0].url;
        }
      } else {
        // Fallback: Direct artwork lookup
        const artwork = artworkMap.get(item.artworkId) || artworkMap.get(item.variantId);
        if (!artwork) {
          return {
            success: false,
            error: `Artwork "${item.title}" could not be verified in the catalog.`,
          };
        }

        if (!artwork.is_available) {
          return {
            success: false,
            error: `"${artwork.title}" is currently unavailable.`,
          };
        }

        unitPrice = Number(artwork.price);
        isFramed = false;
        framingPrice = 0;
        artworkId = artwork.id;
        variantId = null;
        title = artwork.title || item.title;

        if (Array.isArray(artwork.images) && artwork.images.length > 0 && artwork.images[0]?.url) {
          imageUrl = artwork.images[0].url;
        }
      }

      // Security check: Guard against client-side price tampering in localStorage
      if (typeof item.sellingPrice === "number" && item.sellingPrice !== unitPrice) {
        console.warn(`[createOrder] Security: Price discrepancy for "${title}": client=${item.sellingPrice}, db=${unitPrice}`);
        return {
          success: false,
          error: `Price discrepancy detected for "${title}". Please refresh your bag before placing your order.`,
        };
      }

      if (item.isFramed && typeof item.framingPrice === "number" && item.framingPrice !== framingPrice) {
        console.warn(`[createOrder] Security: Framing price discrepancy for "${title}": client=${item.framingPrice}, db=${framingPrice}`);
        return {
          success: false,
          error: `Framing price discrepancy detected for "${title}". Please refresh your bag before placing your order.`,
        };
      }

      const lineTotal = (unitPrice + framingPrice) * quantity;
      subtotal += lineTotal;

      orderItemsToInsert.push({
        artwork_id: artworkId,
        variant_id: variantId,
        title,
        image_url: imageUrl,
        size,
        is_framed: isFramed,
        framing_price: framingPrice,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
      });
    }

    const deliveryCharge = DELIVERY_CHARGE;
    const discountAmount = 0;
    const totalAmount = subtotal + deliveryCharge - discountAmount;

    // Determine initial payment status
    let paymentStatus = "pending";
    if (validData.paymentMethod === "razorpay" && validData.paymentReference) {
      paymentStatus = "paid";
    } else if (validData.receiptUrl || validData.paymentReference) {
      paymentStatus = "receipt_uploaded";
    }

    const orderNumber = generateOrderNumber();

    const shippingAddressJson = {
      street: validData.street,
      landmark: validData.landmark || "",
      city: validData.city,
      state: validData.state,
      pincode: validData.pincode,
      country: validData.country || "India",
    };

    // 1. Insert order (with automatic retry on unique constraint collision)
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

