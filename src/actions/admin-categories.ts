"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image: string;
  alt_text?: string;
  artworkCount: number;
};

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = createAdminClient();

  const [categoriesRes, artworksRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("artworks")
      .select("category_id"),
  ]);

  if (categoriesRes.error || !categoriesRes.data) {
    console.error("Error fetching admin categories:", categoriesRes.error);
    return [];
  }

  // Calculate artwork count per category
  const countsMap = new Map<string, number>();
  if (artworksRes.data) {
    for (const art of artworksRes.data) {
      if (art.category_id) {
        countsMap.set(art.category_id, (countsMap.get(art.category_id) || 0) + 1);
      }
    }
  }

  return categoriesRes.data.map((cat: any) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description || "",
    cover_image: cat.cover_image || "",
    alt_text: cat.alt_text || "",
    artworkCount: countsMap.get(cat.id) || 0,
  }));
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description: string;
  cover_image?: string;
  alt_text?: string;
}) {
  const supabase = createAdminClient();

  const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const id = `cat-${formattedSlug || Date.now()}`;

  const { error } = await supabase
    .from("categories")
    .insert({
      id,
      name: data.name.trim(),
      slug: formattedSlug,
      description: data.description.trim(),
      cover_image: data.cover_image?.trim() || "",
      alt_text: data.alt_text?.trim() || null,
    });

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true, id };
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description: string;
    cover_image?: string;
    alt_text?: string;
  }
) {
  const supabase = createAdminClient();

  const formattedSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const { error } = await supabase
    .from("categories")
    .update({
      name: data.name.trim(),
      slug: formattedSlug,
      description: data.description.trim(),
      cover_image: data.cover_image?.trim() || "",
      alt_text: data.alt_text?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/categories/${formattedSlug}`);
  revalidatePath("/categories");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true };
}

export async function updateCategoryCoverImage(id: string, coverImage: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("categories")
    .update({ cover_image: coverImage })
    .eq("id", id);

  if (error) {
    console.error("Error updating category cover image:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  // Check if any artworks reference this category
  const { count, error: countError } = await supabase
    .from("artworks")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    return { success: false, message: countError.message };
  }

  if (count && count > 0) {
    return {
      success: false,
      message: `Cannot delete this category because ${count} artwork(s) are assigned to it. Please reassign or delete the artworks first.`,
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true };
}

