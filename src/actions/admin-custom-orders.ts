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

export const getAdminCustomOrders = withAdminAuth(async (): Promise<CustomOrder[]> => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminCustomOrders] Error fetching custom orders:", error);
    return [];
  }

  return (data || []).map((order) => ({
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
  }));
}, { fallback: [] });

export const getAdminCustomOrderById = withAdminAuth(async (id: string): Promise<CustomOrder | null> => {
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

  return {
    id: data.id,
    order_reference: data.order_reference,
    status: data.status as CustomOrderStatus,
    created_at: data.created_at,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    country_code: data.country_code,
    phone: data.phone ?? null,
    category: data.category,
    medium: data.medium ?? null,
    surface: data.surface ?? null,
    preferred_size: data.preferred_size ?? null,
    budget: data.budget ?? null,
    reference_link: data.reference_link ?? null,
    reference_images: Array.isArray(data.reference_images) ? data.reference_images : [],
    message: data.message,
    final_category: data.final_category ?? null,
    final_medium: data.final_medium ?? null,
    final_surface: data.final_surface ?? null,
    final_size: data.final_size ?? null,
    final_budget: data.final_budget ?? null,
    items: Array.isArray(data.items) ? (data.items as CustomOrderItem[]) : [],
    quote_total: typeof data.quote_total === "number" ? data.quote_total : Number(data.quote_total) || 0,
    deposit_percentage:
      typeof data.deposit_percentage === "number"
        ? data.deposit_percentage
        : Number(data.deposit_percentage) || 50,
    advance_deposit:
      typeof data.advance_deposit === "number"
        ? data.advance_deposit
        : Number(data.advance_deposit) || 0,
    estimated_timeline: data.estimated_timeline ?? null,
    admin_notes: data.admin_notes ?? null,
  };
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
});

export const updateCustomOrderQuotation = withAdminAuth(async (
  id: string,
  payload: QuotationUpdatePayload
): Promise<{ success: boolean; message?: string }> => {
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
});

export const getAdminCustomOrderTaxonomies = withAdminAuth(async (): Promise<{
  categories: string[];
  surfaces: string[];
  mediums: string[];
}> => {
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
}, { fallback: { categories: [], surfaces: [], mediums: [] } });

export const updateCustomOrderStatus = withAdminAuth(async (
  id: string,
  status: string
): Promise<{ success: boolean; message?: string }> => {
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
});

export const deleteCustomOrder = withAdminAuth(async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
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
});
