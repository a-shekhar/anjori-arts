"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import { COURIER_PARTNERS } from "@/config/constants";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types";

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

function mapOrder(order: any, items: OrderItem[] = []): Order {
  return {
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id ?? null,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    country_code: order.country_code || "+91",
    shipping_address: order.shipping_address || {},
    delivery_instructions: order.delivery_instructions ?? null,
    subtotal: Number(order.subtotal) || 0,
    delivery_charge: Number(order.delivery_charge) || 0,
    discount_amount: Number(order.discount_amount) || 0,
    total_amount: Number(order.total_amount) || 0,
    currency: order.currency || "INR",
    payment_method: order.payment_method,
    payment_status: order.payment_status as PaymentStatus,
    payment_reference: order.payment_reference ?? null,
    receipt_url: order.receipt_url ?? null,
    order_status: order.order_status as OrderStatus,
    courier_name: order.courier_name ?? null,
    tracking_number: order.tracking_number ?? null,
    tracking_url: order.tracking_url ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    admin_notes: order.admin_notes ?? null,
    gateway_order_id: order.gateway_order_id ?? null,
    paid_at: order.paid_at ?? null,
    cancellation_reason: order.cancellation_reason ?? null,
    refund_reference: order.refund_reference ?? null,
    refund_amount: Number(order.refund_amount) || 0,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items,
  };
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

      if (search.trim()) {
        const term = search.trim();
        query = query.or(
          `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%`
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
      const supabase = createAdminClient();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .or(`id.eq.${id},order_number.eq.${id}`)
        .maybeSingle();

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
          .select("order_status")
          .eq("id", orderId)
          .maybeSingle();

        if (currentOrder && currentOrder.order_status === "received") {
          updateData.order_status = "confirmed";
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

