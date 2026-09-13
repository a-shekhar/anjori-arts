"use server";

import { Artwork, Category } from "@/types";
import { mapArtwork } from "@/lib/mappers";
import { getAnonClient } from "@/lib/supabase/anon";
import { HOMEPAGE_FEATURED_LIMIT } from "@/config/constants";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = getAnonClient();
    let { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error && error.code === "42703") {
      const fallback = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data as Category[];
  } catch (err) {
    console.error("[getAllCategories] Unexpected error:", err);
    return [];
  }
}

export async function getShopData(): Promise<{ artworks: Artwork[]; categories: Category[] }> {
  try {
    const supabase = getAnonClient();

    const [categories, artworksResult] = await Promise.all([
      getAllCategories(),
      supabase
        .from("artworks")
        .select(`
          *,
          surface:surfaces(*),
          artwork_mediums(medium:mediums(*)),
          variants:artwork_variants(*)
        `)
        .order("created_at", { ascending: false }),
    ]);

    if (artworksResult.error) {
      console.error("Error fetching artworks:", artworksResult.error);
      return { artworks: [], categories: categories || [] };
    }

    const artworks = (artworksResult.data || []).map(mapArtwork);

    return {
      artworks,
      categories,
    };
  } catch (err) {
    console.error("[getShopData] Unexpected error:", err);
    return { artworks: [], categories: [] };
  }
}

export async function getFeaturedArtworks(limit = HOMEPAGE_FEATURED_LIMIT): Promise<(Artwork & { category?: Category })[]> {
  try {
    const supabase = getAnonClient();

    const { data, error } = await supabase
      .from("artworks")
      .select(`
        *,
        surface:surfaces(*),
        category:categories(*),
        artwork_mediums(medium:mediums(*)),
        variants:artwork_variants(*)
      `)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error("Error fetching featured artworks:", error);
      return [];
    }

    return data.map((art: any) => ({
      ...mapArtwork(art),
      category: art.category as Category | undefined,
    }));
  } catch (err) {
    console.error("[getFeaturedArtworks] Unexpected error:", err);
    return [];
  }
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const supabase = getAnonClient();

    const { data: art, error } = await supabase
      .from("artworks")
      .select(`
        *,
        surface:surfaces(*),
        artwork_mediums(medium:mediums(*)),
        variants:artwork_variants(*)
      `)
      .eq("slug", slug)
      .single();

    if (error || !art) {
      return null;
    }

    return mapArtwork(art);
  } catch (err) {
    console.error("[getArtworkBySlug] Unexpected error:", err);
    return null;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as Category;
  } catch (err) {
    console.error("[getCategoryById] Unexpected error:", err);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data as Category;
  } catch (err) {
    console.error("[getCategoryBySlug] Unexpected error:", err);
    return null;
  }
}

export async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase.from("categories").select("slug");
    
    if (error || !data) return [];
    return data as { slug: string }[];
  } catch (err) {
    console.error("[getAllCategorySlugs] Unexpected error:", err);
    return [];
  }
}

export async function getArtworksByCategory(categoryId: string): Promise<Artwork[]> {
  try {
    const supabase = getAnonClient();
    const { data: artworksData, error } = await supabase
      .from("artworks")
      .select(`
        *,
        surface:surfaces(*),
        artwork_mediums(medium:mediums(*)),
        variants:artwork_variants(*)
      `)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error || !artworksData) return [];
    return artworksData.map(mapArtwork);
  } catch (err) {
    console.error("[getArtworksByCategory] Unexpected error:", err);
    return [];
  }
}

export async function getRelatedArtworks(categoryId: string, excludeId: string): Promise<Artwork[]> {
  try {
    const supabase = getAnonClient();

    const { data: artworksData, error } = await supabase
      .from("artworks")
      .select(`
        *,
        surface:surfaces(*),
        artwork_mediums(medium:mediums(*)),
        variants:artwork_variants(*)
      `)
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .limit(4);

    if (error || !artworksData) {
      return [];
    }

    return artworksData.map(mapArtwork);
  } catch (err) {
    console.error("[getRelatedArtworks] Unexpected error:", err);
    return [];
  }
}

export async function getAllArtworkSlugs(): Promise<{ slug: string }[]> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase.from("artworks").select("slug");
    
    if (error || !data) {
      return [];
    }
    
    return data as { slug: string }[];
  } catch (err) {
    console.error("[getAllArtworkSlugs] Unexpected error:", err);
    return [];
  }
}

