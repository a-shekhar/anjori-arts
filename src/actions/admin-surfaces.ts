"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/lib/auth-admin";

export type AdminSurface = {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  artworkCount: number;
};

export const getAdminSurfaces = withAdminAuth(async (): Promise<AdminSurface[]> => {
  try {
    const supabase = createAdminClient();

    const [surfacesRes, artworksRes] = await Promise.all([
      supabase
        .from("surfaces")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("artworks")
        .select("surface_id"),
    ]);

    if (surfacesRes.error || !surfacesRes.data) {
      console.error("Error fetching admin surfaces:", surfacesRes.error);
      return [];
    }

    // Calculate artwork count per surface
    const countsMap = new Map<string, number>();
    if (artworksRes.data) {
      for (const art of artworksRes.data) {
        if (art.surface_id) {
          countsMap.set(art.surface_id, (countsMap.get(art.surface_id) || 0) + 1);
        }
      }
    }

    return surfacesRes.data.map((surface: any) => ({
      id: surface.id,
      slug: surface.slug,
      name: surface.name,
      display_order: typeof surface.display_order === "number" ? surface.display_order : 0,
      is_active: surface.is_active ?? true,
      created_at: surface.created_at || new Date().toISOString(),
      artworkCount: countsMap.get(surface.id) || 0,
    }));
  } catch (err) {
    console.error("[getAdminSurfaces] Unexpected error:", err);
    return [];
  }
}, { fallback: [] });

export const createSurface = withAdminAuth(async (data: {
  name: string;
  slug: string;
  display_order?: number;
  is_active?: boolean;
}) => {
  try {
    const supabase = createAdminClient();

    const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!formattedSlug) {
      return { success: false, message: "Valid slug is required." };
    }

    const { data: inserted, error } = await supabase
      .from("surfaces")
      .insert({
        name: data.name.trim(),
        slug: formattedSlug,
        display_order: Number.isFinite(data.display_order) ? Number(data.display_order) : 0,
        is_active: data.is_active ?? true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating surface:", error);
      if (error.code === "23505") {
        return { success: false, message: `A surface with slug "${formattedSlug}" already exists.` };
      }
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/surfaces");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true, id: inserted?.id };
  } catch (err: any) {
    console.error("[createSurface] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while creating the surface." };
  }
});

export const updateSurface = withAdminAuth(async (
  id: string,
  data: {
    name: string;
    slug: string;
    display_order?: number;
    is_active?: boolean;
  }
) => {
  try {
    const supabase = createAdminClient();

    const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!formattedSlug) {
      return { success: false, message: "Valid slug is required." };
    }

    const { error } = await supabase
      .from("surfaces")
      .update({
        name: data.name.trim(),
        slug: formattedSlug,
        display_order: Number.isFinite(data.display_order) ? Number(data.display_order) : 0,
        is_active: data.is_active ?? true,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating surface:", error);
      if (error.code === "23505") {
        return { success: false, message: `A surface with slug "${formattedSlug}" already exists.` };
      }
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/surfaces");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[updateSurface] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while updating the surface." };
  }
});

export const toggleSurfaceActive = withAdminAuth(async (id: string, is_active: boolean) => {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("surfaces")
      .update({ is_active })
      .eq("id", id);

    if (error) {
      console.error("Error toggling surface active status:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/surfaces");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[toggleSurfaceActive] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred." };
  }
});

export const deleteSurface = withAdminAuth(async (id: string) => {
  try {
    const supabase = createAdminClient();

    // Check if any artworks reference this surface
    const { count, error: countError } = await supabase
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .eq("surface_id", id);

    if (countError) {
      return { success: false, message: countError.message };
    }

    if (count && count > 0) {
      return {
        success: false,
        message: `Cannot delete this surface because ${count} artwork(s) are assigned to it. Deactivate it instead to hide it from selection dropdowns.`,
      };
    }

    const { error } = await supabase
      .from("surfaces")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting surface:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/surfaces");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteSurface] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while deleting the surface." };
  }
});

export const reorderSurfaces = withAdminAuth(async (orderedIds: string[]) => {
  try {
    const supabase = createAdminClient();

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("surfaces")
        .update({ display_order: (index + 1) * 10 })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      console.error("Error reordering surfaces:", firstError);
      return { success: false, message: firstError.message };
    }

    revalidatePath("/admin/surfaces");
    revalidatePath("/admin/artworks");
    revalidatePath("/admin/artworks/new");
    revalidatePath("/custom-order");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: any) {
    console.error("[reorderSurfaces] Unexpected error:", err);
    return { success: false, message: err?.message || "An unexpected error occurred while reordering surfaces." };
  }
});

