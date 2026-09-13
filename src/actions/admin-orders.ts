"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePostgrestFilterTerm, sanitizePostgrestIdentifier, isUuid } from "@/lib/supabase/sanitize";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import { COURIER_PARTNERS } from "@/config/constants";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types";
import { mapOrder } from "@/lib/mappers";

export interface AdminOrdersFilter {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrdersResponse {
  orders: Order[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderStats {
  totalOrders: number;
  pendingVerification: number;
  inFramingPacking: number;
  dispatched: number;
  delivered: number;
  totalRevenue: number; // in paise
}


export const getAdminOrders = withAdminAuth(
  async (filters: AdminOrdersFilter = {}): Promise<AdminOrdersResponse> => {
    try {
      const {
        search = "",
        status = "all",
        paymentStatus = "all",
        page = 1,
        limit = 20,
      } = filters;

      const supabase = createAdminClient();
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("orders")
        .select("*", { count: "exact" });

      if (status && status !== "all") {
        query = query.eq("order_status", status);
      }

      if (paymentStatus && paymentStatus !== "all") {
        query = query.eq("payment_status", paymentStatus);
      }

      const cleanTerm = sanitizePostgrestFilterTerm(search);
      if (cleanTerm) {
        query = query.or(
          `order_number.ilike.%${cleanTerm}%,customer_name.ilike.%${cleanTerm}%,customer_email.ilike.%${cleanTerm}%,customer_phone.ilike.%${cleanTerm}%`
        );
      }

      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("[getAdminOrders] Error fetching orders:", error);
        return { orders: [], totalCount: 0, page, limit, totalPages: 0 };
      }

      const orders = (data || []).map((o) => mapOrder(o));
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit) || 1;

      return {
        orders,
        totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (err) {
      console.error("[getAdminOrders] Unexpected error:", err);
      return { orders: [], totalCount: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },
  { fallback: { orders: [], totalCount: 0, page: 1, limit: 20, totalPages: 0 } }
);

export const getAdminOrderById = withAdminAuth(
  async (id: string): Promise<Order | null> => {
    try {
      const cleanId = sanitizePostgrestIdentifier(id);
      if (!cleanId) {
        return null;
      }

      const supabase = createAdminClient();
      let query = supabase.from("orders").select("*");

      if (isUuid(cleanId)) {
        query = query.or(`id.eq.${cleanId},order_number.eq.${cleanId}`);
      } else {
        query = query.eq("order_number", cleanId);
      }

      const { data: order, error: orderError } = await query.maybeSingle();

      if (orderError || !order) {
        console.error("[getAdminOrderById] Error finding order:", orderError);
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (itemsError) {
        console.error("[getAdminOrderById] Error finding items:", itemsError);
      }

      return mapOrder(order, (items || []) as OrderItem[]);
    } catch (err) {
      console.error("[getAdminOrderById] Unexpected error:", err);
      return null;
    }
  },
  { fallback: null }
);

export const updateAdminOrderStatus = withAdminAuth(
  async (
    orderId: string,
    status: OrderStatus,
    adminNotes?: string,
    cancellationReason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createAdminClient();

      const updatePayload: Record<string, any> = {
        order_status: status,
        updated_at: new Date().toISOString(),
      };

      if (adminNotes !== undefined) {
        updatePayload.admin_notes = adminNotes;
      }

      if (cancellationReason !== undefined) {
        updatePayload.cancellation_reason = cancellationReason;
      }

      if (status === "confirmed" || status === "framing_packing") {
        const { data: currentOrder } = await supabase
          .from("orders")
          .select("order_status, payment_method, order_items(variant_id, quantity)")
          .eq("id", orderId)
          .maybeSingle();

        if (
          currentOrder &&
          currentOrder.payment_method === "pay_on_dispatch" &&
          currentOrder.order_status === "received" &&
          currentOrder.order_items
        ) {
          for (const it of currentOrder.order_items as any[]) {
            if (it.variant_id) {
              await supabase.rpc("decrement_variant_stock", {
                p_variant_id: it.variant_id,
                p_quantity: it.quantity,
              });
            }
          }
        }
      }

      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (error) {
        console.error("[updateAdminOrderStatus] Update error:", error);
        return { success: false, error: "Failed to update order status." };
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } catch (err: unknown) {
      console.error("[updateAdminOrderStatus] Unexpected error:", err);
      return { success: false, error: err instanceof Error ? err.message : "Error updating order." };
    }
  },
  { fallback: { success: false, error: "Unauthorized" } }
);

export const updateAdminCourierTracking = withAdminAuth(
  async (
    orderId: string,
    payload: {
      courierName: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
      autoAdvanceStatus?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createAdminClient();

      // Generate tracking URL automatically if empty and known partner
      let finalTrackingUrl = payload.trackingUrl?.trim() || "";
      if (!finalTrackingUrl && payload.trackingNumber.trim()) {
        const partner = COURIER_PARTNERS.find(
          (c) => c.name.toLowerCase() === payload.courierName.toLowerCase()
        );
        if (partner && partner.urlPrefix) {
          finalTrackingUrl = `${partner.urlPrefix}${encodeURIComponent(payload.trackingNumber.trim())}`;
        }
      }

      const updateData: Record<string, any> = {
        courier_name: payload.courierName,
        tracking_number: payload.trackingNumber.trim(),
        tracking_url: finalTrackingUrl || null,
        estimated_delivery: payload.estimatedDelivery || null,
        updated_at: new Date().toISOString(),
      };

      if (payload.autoAdvanceStatus) {
        updateData.order_status = "dispatched";
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        console.error("[updateAdminCourierTracking] Error updating tracking:", error);
        return { success: false, error: "Failed to update tracking details." };
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } catch (err: unknown) {
      console.error("[updateAdminCourierTracking] Unexpected error:", err);
      return { success: false, error: err instanceof Error ? err.message : "Error updating tracking." };
    }
  },
  { fallback: { success: false, error: "Unauthorized" } }
);

export const verifyAdminPayment = withAdminAuth(
  async (
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentReference?: string,
    refundDetails?: {
      refundReference?: string;
      refundAmount?: number;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createAdminClient();

      const updateData: Record<string, any> = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentReference !== undefined) {
        updateData.payment_reference = paymentReference;
      }

      // If payment is marked verified/paid, set paid_at timestamp
      if (paymentStatus === "verified" || paymentStatus === "paid") {
        updateData.paid_at = new Date().toISOString();

        // Advance received order to confirmed
        const { data: currentOrder } = await supabase
          .from("orders")
          .select("order_status, payment_method, order_items(variant_id, quantity)")
          .eq("id", orderId)
          .maybeSingle();

        if (currentOrder && currentOrder.order_status === "received") {
          updateData.order_status = "confirmed";

          // If this was pay_on_dispatch, stock wasn't decremented at checkout; decrement now upon payment verification
          if (currentOrder.payment_method === "pay_on_dispatch" && currentOrder.order_items) {
            for (const it of currentOrder.order_items as any[]) {
              if (it.variant_id) {
                await supabase.rpc("decrement_variant_stock", {
                  p_variant_id: it.variant_id,
                  p_quantity: it.quantity,
                });
              }
            }
          }
        }
      }

      // If refunded, store refund reference and refund amount
      if (paymentStatus === "refunded" && refundDetails) {
        if (refundDetails.refundReference !== undefined) {
          updateData.refund_reference = refundDetails.refundReference;
        }
        if (refundDetails.refundAmount !== undefined) {
          updateData.refund_amount = refundDetails.refundAmount;
        }
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        console.error("[verifyAdminPayment] Error verifying payment:", error);
        return { success: false, error: "Failed to verify payment." };
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } catch (err: unknown) {
      console.error("[verifyAdminPayment] Unexpected error:", err);
      return { success: false, error: err instanceof Error ? err.message : "Error verifying payment." };
    }
  },
  { fallback: { success: false, error: "Unauthorized" } }
);

export const getAdminOrderStats = withAdminAuth(
  async (): Promise<AdminOrderStats> => {
    try {
      const supabase = createAdminClient();

      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_status, payment_status, total_amount");

      if (error || !orders) {
        console.error("[getAdminOrderStats] Error:", error);
        return {
          totalOrders: 0,
          pendingVerification: 0,
          inFramingPacking: 0,
          dispatched: 0,
          delivered: 0,
          totalRevenue: 0,
        };
      }

      let pendingVerification = 0;
      let inFramingPacking = 0;
      let dispatched = 0;
      let delivered = 0;
      let totalRevenue = 0;

      for (const order of orders) {
        if (order.payment_status === "receipt_uploaded" || order.payment_status === "pending") {
          pendingVerification++;
        }
        if (order.order_status === "framing_packing") {
          inFramingPacking++;
        }
        if (order.order_status === "dispatched") {
          dispatched++;
        }
        if (order.order_status === "delivered") {
          delivered++;
        }
        if (order.payment_status === "paid" || order.payment_status === "verified") {
          totalRevenue += Number(order.total_amount) || 0;
        }
      }

      return {
        totalOrders: orders.length,
        pendingVerification,
        inFramingPacking,
        dispatched,
        delivered,
        totalRevenue,
      };
    } catch (err) {
      console.error("[getAdminOrderStats] Unexpected error:", err);
      return {
        totalOrders: 0,
        pendingVerification: 0,
        inFramingPacking: 0,
        dispatched: 0,
        delivered: 0,
        totalRevenue: 0,
      };
    }
  },
  {
    fallback: {
      totalOrders: 0,
      pendingVerification: 0,
      inFramingPacking: 0,
      dispatched: 0,
      delivered: 0,
      totalRevenue: 0,
    },
  }
);

