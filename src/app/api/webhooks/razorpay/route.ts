import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderPlacedEmail, sendAdminOrderAlertEmail } from "@/lib/email";

/**
 * Razorpay Webhook Handler
 * Endpoint: POST /api/webhooks/razorpay
 *
 * Listens to asynchronous lifecycle events directly from Razorpay's servers
 * (e.g. payment.captured, order.paid, payment.failed, refund.processed).
 * Acts as an automated safety net if a customer's browser closes before redirecting.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn(
      "[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured. Webhook rejected for security."
    );
    return NextResponse.json(
      { error: "Webhook secret is not configured on this server." },
      { status: 500 }
    );
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing x-razorpay-signature header." }, { status: 400 });
  }

  try {
    const rawBody = await req.text();

    // 1. Verify cryptographic HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      console.error("[Razorpay Webhook] Invalid webhook signature detected.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    // 2. Parse payload event
    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const payload = event.payload;

    const supabase = createAdminClient();

    // 3. Process events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        // Find existing order by gateway_order_id
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("gateway_order_id", gatewayOrderId)
          .maybeSingle();

        if (order && order.payment_status !== "paid") {
          const updateData: Record<string, any> = {
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (paymentId) {
            updateData.payment_reference = paymentId;
          }

          if (order.order_status === "received") {
            updateData.order_status = "confirmed";
          }

          await supabase.from("orders").update(updateData).eq("id", order.id);
          console.log(`[Razorpay Webhook] Order ${order.id} (${order.order_number}) marked as paid via webhook.`);

          // Fetch items for email dispatch and stock decrement
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          // Atomically decrement ready stock for ordered variants (down to 0, never negative)
          for (const item of (items || [])) {
            if (item.variant_id) {
              supabase
                .rpc("decrement_variant_stock", {
                  p_variant_id: item.variant_id,
                  p_quantity: item.quantity || 1,
                })
                .then(({ error }: { error: any }) => {
                  if (error) {
                    console.error("[Razorpay Webhook] Error decrementing stock for variant:", item.variant_id, error);
                  }
                });
            }
          }

          const orderItems = (items || []).map((i: any) => ({
            title: i.title || "Artwork",
            size: i.size || "",
            is_framed: !!i.is_framed,
            quantity: i.quantity || 1,
            unit_price: (i.unit_price || 0) + (i.framing_price || 0),
          }));

          const shippingAddress = (order.shipping_address as any) || {
            street: "",
            city: "",
            state: "",
            pincode: "",
          };

          // Dispatch confirmation and admin alert emails asynchronously
          Promise.allSettled([
            sendOrderPlacedEmail({
              order_number: order.order_number,
              customer_name: order.customer_name,
              customer_email: order.customer_email,
              total_amount: order.total_amount,
              payment_method: "razorpay",
              payment_status: "paid",
              shipping_address: {
                street: shippingAddress.street || "",
                city: shippingAddress.city || "",
                state: shippingAddress.state || "",
                pincode: shippingAddress.pincode || "",
              },
              items: orderItems,
            }),
            sendAdminOrderAlertEmail({
              order_id: order.id,
              order_number: order.order_number,
              customer_name: order.customer_name,
              customer_email: order.customer_email,
              customer_phone: order.customer_phone,
              country_code: order.country_code || "+91",
              total_amount: order.total_amount,
              payment_method: "razorpay",
              payment_status: "paid",
              payment_reference: paymentId || order.payment_reference,
              delivery_instructions: order.delivery_instructions,
              shipping_address: shippingAddress,
              items: orderItems,
            }),
          ]).catch((emailErr) => {
            console.error("[Razorpay Webhook] Error sending order emails:", emailErr);
          });
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;

      if (gatewayOrderId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id, payment_status")
          .eq("gateway_order_id", gatewayOrderId)
          .maybeSingle();

        if (order && order.payment_status === "pending") {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);
          console.log(`[Razorpay Webhook] Order ${order.id} marked as failed.`);
        }
      }
    } else if (eventType === "refund.processed") {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_reference", paymentId)
          .maybeSingle();

        if (order) {
          await supabase
            .from("orders")
            .update({
              payment_status: "refunded",
              refund_reference: refundEntity.id || null,
              refund_amount: refundEntity.amount || 0,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);
          console.log(`[Razorpay Webhook] Order ${order.id} marked as refunded.`);
        }
      }
    }

    return NextResponse.json({ status: "success", received: true });
  } catch (err: unknown) {
    console.error("[Razorpay Webhook] Error processing event:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal processing error." },
      { status: 500 }
    );
  }
}

