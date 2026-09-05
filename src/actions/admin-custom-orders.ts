"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import type { CustomOrder, CustomOrderStatus, CustomOrderItem } from "@/types";

export interface QuotationUpdatePayload {
  items: CustomOrderItem[];
  quote_total: number;
  deposit_percentage: number;
  advance_deposit: number;
  estimated_timeline?: string | null;
  admin_notes?: string | null;
  updateStatusToQuoted?: boolean;
}

function mapCustomOrder(order: any): CustomOrder {
  return {
    id: order.id,
    order_reference: order.order_reference,
    status: order.status as CustomOrderStatus,
    created_at: order.created_at,
    first_name: order.first_name,
    last_name: order.last_name,
    email: order.email,
    country_code: order.country_code,
    phone: order.phone ?? null,
    category: order.category,
    medium: order.medium ?? null,
    surface: order.surface ?? null,
    preferred_size: order.preferred_size ?? null,
    budget: order.budget ?? null,
    reference_link: order.reference_link ?? null,
    reference_images: Array.isArray(order.reference_images) ? order.reference_images : [],
    message: order.message,
    final_category: order.final_category ?? null,
    final_medium: order.final_medium ?? null,
    final_surface: order.final_surface ?? null,
    final_size: order.final_size ?? null,
    final_budget: order.final_budget ?? null,
    items: Array.isArray(order.items) ? (order.items as CustomOrderItem[]) : [],
    quote_total: typeof order.quote_total === "number" ? order.quote_total : Number(order.quote_total) || 0,
    deposit_percentage:
      typeof order.deposit_percentage === "number"
        ? order.deposit_percentage
        : Number(order.deposit_percentage) || 50,
    advance_deposit:
      typeof order.advance_deposit === "number"
        ? order.advance_deposit
        : Number(order.advance_deposit) || 0,
    estimated_timeline: order.estimated_timeline ?? null,
    admin_notes: order.admin_notes ?? null,
  };
}

export const getAdminCustomOrders = withAdminAuth(async (): Promise<CustomOrder[]> => {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("custom_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAdminCustomOrders] Error fetching custom orders:", error);
      return [];
    }

    return (data || []).map(mapCustomOrder);
  } catch (err) {
    console.error("[getAdminCustomOrders] Unexpected error:", err);
    return [];
  }
}, { fallback: [] });

export const getAdminCustomOrderById = withAdminAuth(async (id: string): Promise<CustomOrder | null> => {
  try {
    const supabase = createAdminClient();

    // Try matching by UUID id or order_reference
    const { data, error } = await supabase
      .from("custom_orders")
      .select("*")
      .or(`id.eq.${id},order_reference.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.error("[getAdminCustomOrderById] Error fetching custom order:", error);
      return null;
    }

    if (!data) return null;

    return mapCustomOrder(data);
  } catch (err) {
    console.error("[getAdminCustomOrderById] Unexpected error:", err);
    return null;
  }
}, { fallback: null });

export const updateCustomOrderAgreedSpecs = withAdminAuth(async (
  id: string,
  specs: {
    final_category?: string | null;
    final_medium?: string | null;
    final_surface?: string | null;
    final_size?: string | null;
    final_budget?: string | null;
  }
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id) {
      return { success: false, message: "Order ID is required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("custom_orders")
      .update({
        final_category: specs.final_category || null,
        final_medium: specs.final_medium || null,
        final_surface: specs.final_surface || null,
        final_size: specs.final_size || null,
        final_budget: specs.final_budget || null,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateCustomOrderAgreedSpecs] Error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/custom-orders");
    revalidatePath(`/admin/custom-orders/${id}`);

    return { success: true };
  } catch (err: any) {
    console.error("[updateCustomOrderAgreedSpecs] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while updating order specifications." };
  }
});

export const updateCustomOrderQuotation = withAdminAuth(async (
  id: string,
  payload: QuotationUpdatePayload
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id) {
      return { success: false, message: "Order ID is required." };
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      items: payload.items || [],
      quote_total: payload.quote_total || 0,
      deposit_percentage: payload.deposit_percentage ?? 50,
      advance_deposit: payload.advance_deposit || 0,
      estimated_timeline: payload.estimated_timeline || null,
      admin_notes: payload.admin_notes || null,
    };

    if (payload.updateStatusToQuoted) {
      updateData.status = "quoted";
    }

    const { error } = await supabase
      .from("custom_orders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("[updateCustomOrderQuotation] Error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/custom-orders");
    revalidatePath(`/admin/custom-orders/${id}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[updateCustomOrderQuotation] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while updating the quotation." };
  }
});

export const getAdminCustomOrderTaxonomies = withAdminAuth(async (): Promise<{
  categories: string[];
  surfaces: string[];
  mediums: string[];
}> => {
  try {
    const supabase = createAdminClient();
    const [{ data: categories }, { data: surfaces }, { data: mediums }] = await Promise.all([
      supabase.from("categories").select("name").order("name"),
      supabase.from("surfaces").select("name").order("name"),
      supabase.from("mediums").select("name").order("name"),
    ]);

    return {
      categories: (categories || []).map((c) => c.name),
      surfaces: (surfaces || []).map((s) => s.name),
      mediums: (mediums || []).map((m) => m.name),
    };
  } catch (err) {
    console.error("[getAdminCustomOrderTaxonomies] Unexpected error:", err);
    return { categories: [], surfaces: [], mediums: [] };
  }
}, { fallback: { categories: [], surfaces: [], mediums: [] } });

export const updateCustomOrderStatus = withAdminAuth(async (
  id: string,
  status: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id || !status) {
      return { success: false, message: "Order ID and status are required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("custom_orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("[updateCustomOrderStatus] Error updating status:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/custom-orders");
    revalidatePath(`/admin/custom-orders/${id}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[updateCustomOrderStatus] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while updating order status." };
  }
});

export const deleteCustomOrder = withAdminAuth(async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!id) {
      return { success: false, message: "Order ID is required." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("custom_orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[deleteCustomOrder] Error deleting custom order:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/custom-orders");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteCustomOrder] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while deleting the custom order." };
  }
});
