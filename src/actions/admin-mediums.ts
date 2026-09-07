"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/lib/auth-admin";

export type AdminMedium = {
  id: string;
  slug: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string;
  artworkCount: number;
};

export const getAdminMediums = withAdminAuth(async (): Promise<AdminMedium[]> => {
  try {
    const supabase = createAdminClient();

    let [mediumsRes, artworkMediumsRes] = await Promise.all([
      supabase
        .from("mediums")
        .select("*")
        .order("name", { ascending: true }),
      supabase
        .from("artwork_mediums")
        .select("medium_id"),
    ]);

    if (mediumsRes.error || !mediumsRes.data) {
      console.error("Error fetching admin mediums:", mediumsRes.error);
      return [];
    }

    // Calculate artwork count per medium
    const countsMap = new Map<string, number>();
    if (artworkMediumsRes.data) {
      for (const item of artworkMediumsRes.data) {
        if (item.medium_id) {
          countsMap.set(item.medium_id, (countsMap.get(item.medium_id) || 0) + 1);
        }
      }
    }

    return mediumsRes.data.map((med: any) => ({
      id: med.id,
      slug: med.slug,
      name: med.name,
      description: med.description || "",
      display_order: typeof med.display_order === "number" ? med.display_order : 0,
      created_at: med.created_at || new Date().toISOString(),
      artworkCount: countsMap.get(med.id) || 0,
    }));
  } catch (err) {
    console.error("[getAdminMediums] Unexpected error:", err);
    return [];
  }
}, { fallback: [] });

export const createMedium = withAdminAuth(async (data: {
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
}) => {
  try {
    const supabase = createAdminClient();

    const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!formattedSlug) {
      return { success: false, message: "Valid slug is required." };
    }

    const id = `med-${formattedSlug || Date.now()}`;

    const insertPayload: any = {
      id,
      name: data.name.trim(),
      slug: formattedSlug,
      description: data.description?.trim() || null,
      display_order: Number.isFinite(data.display_order) ? Number(data.display_order) : 0,
    };

    let { error } = await supabase
      .from("mediums")
      .insert(insertPayload);

    if (error && error.code === "42703") {
      delete insertPayload.display_order;
      const retry = await supabase.from("mediums").insert(insertPayload);
      error = retry.error;
    }

    if (error) {
      console.error("Error creating medium:", error);
      if (error.code === "23505") {
        return { success: false, message: `A medium with slug "${formattedSlug}" already exists.` };
      }
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/mediums");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true, id };
  } catch (err: any) {
    console.error("[createMedium] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while creating the medium." };
  }
});

export const updateMedium = withAdminAuth(async (
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    display_order?: number;
  }
) => {
  try {
    const supabase = createAdminClient();

    const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!formattedSlug) {
      return { success: false, message: "Valid slug is required." };
    }

    const updatePayload: any = {
      name: data.name.trim(),
      slug: formattedSlug,
      description: data.description?.trim() || null,
    };

    if (Number.isFinite(data.display_order)) {
      updatePayload.display_order = Number(data.display_order);
    }

    let { error } = await supabase
      .from("mediums")
      .update(updatePayload)
      .eq("id", id);

    if (error && error.code === "42703") {
      delete updatePayload.display_order;
      const retry = await supabase.from("mediums").update(updatePayload).eq("id", id);
      error = retry.error;
    }

    if (error) {
      console.error("Error updating medium:", error);
      if (error.code === "23505") {
        return { success: false, message: `A medium with slug "${formattedSlug}" already exists.` };
      }
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/mediums");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[updateMedium] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while updating the medium." };
  }
});

export const reorderMediums = withAdminAuth(async (orderedIds: string[]) => {
  try {
    const supabase = createAdminClient();

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("mediums")
        .update({ display_order: (index + 1) * 10 })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      console.error("Error reordering mediums:", firstError);
      if (firstError.code === "42703") {
        return {
          success: false,
          message: "The display_order column does not exist yet. Please run migration 20260906006000 in Supabase.",
        };
      }
      return { success: false, message: firstError.message };
    }

    revalidatePath("/admin/mediums");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[reorderMediums] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while reordering mediums." };
  }
});

export const deleteMedium = withAdminAuth(async (id: string) => {
  try {
    const supabase = createAdminClient();

    // Check if any artworks reference this medium
    const { count, error: countError } = await supabase
      .from("artwork_mediums")
      .select("artwork_id", { count: "exact", head: true })
      .eq("medium_id", id);

    if (countError) {
      return { success: false, message: countError.message };
    }

    if (count && count > 0) {
      return {
        success: false,
        message: `Cannot delete this medium because ${count} artwork(s) are assigned to it. Please remove or reassign it from those artworks first.`,
      };
    }

    const { error } = await supabase
      .from("mediums")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting medium:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/mediums");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteMedium] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while deleting the medium." };
  }
});
