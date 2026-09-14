"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePostgrestIdentifier, isUuid } from "@/lib/supabase/sanitize";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import type { CustomOrder, CustomOrderItem } from "@/types";
import { mapCustomOrder } from "@/lib/mappers";
import { deleteCustomOrderFolder } from "@/lib/cloudinary-server";
import { DEFAULT_CATEGORIES } from "@/config/categories";

export interface QuotationUpdatePayload {
  items: CustomOrderItem[];
  quote_total: number;
  deposit_percentage: number;
  advance_deposit: number;
  estimated_timeline?: string | null;
  admin_notes?: string | null;
  updateStatusToQuoted?: boolean;
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
    const cleanId = sanitizePostgrestIdentifier(id);
    if (!cleanId) {
      return null;
    }

    const supabase = createAdminClient();
    let query = supabase.from("custom_orders").select("*");

    // Try matching by UUID id or order_reference
    if (isUuid(cleanId)) {
      query = query.or(`id.eq.${cleanId},order_reference.eq.${cleanId}`);
    } else {
      query = query.eq("order_reference", cleanId);
    }

    const { data, error } = await query.maybeSingle();

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
  } catch (err: unknown) {
    console.error("[updateCustomOrderAgreedSpecs] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating order specifications." };
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
  } catch (err: unknown) {
    console.error("[updateCustomOrderQuotation] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating the quotation." };
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

    const categoryNames = (categories && categories.length > 0)
      ? categories.map((c) => c.name)
      : DEFAULT_CATEGORIES.map((c) => c.name);

    return {
      categories: categoryNames,
      surfaces: (surfaces || []).map((s) => s.name),
      mediums: (mediums || []).map((m) => m.name),
    };
  } catch (err) {
    console.error("[getAdminCustomOrderTaxonomies] Unexpected error:", err);
    return { categories: DEFAULT_CATEGORIES.map((c) => c.name), surfaces: [], mediums: [] };
  }
}, { fallback: { categories: DEFAULT_CATEGORIES.map((c) => c.name), surfaces: [], mediums: [] } });

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
  } catch (err: unknown) {
    console.error("[updateCustomOrderStatus] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating order status." };
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

    // 1. Fetch order id before deletion to clean up Cloudinary assets
    const { data: order } = await supabase
      .from("custom_orders")
      .select("id")
      .eq("id", id)
      .single();

    // 2. Delete from Supabase
    const { error } = await supabase
      .from("custom_orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[deleteCustomOrder] Error deleting custom order:", error);
      return { success: false, message: error.message };
    }

    // 3. Purge Cloudinary customer reference images folder
    if (order?.id) {
      try {
        await deleteCustomOrderFolder(order.id);
      } catch (cloudErr) {
        console.error("[deleteCustomOrder] Cloudinary cleanup error:", cloudErr);
      }
    }

    revalidatePath("/admin/custom-orders");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteCustomOrder] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while deleting the custom order." };
  }
});
