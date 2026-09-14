"use server";

import { Artwork, Category } from "@/types";
import { mapArtwork } from "@/lib/mappers";
import { getAnonClient } from "@/lib/supabase/anon";
import { HOMEPAGE_FEATURED_LIMIT } from "@/config/constants";
import { DEFAULT_CATEGORIES } from "@/config/categories";

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

    if (error || !data || data.length === 0) {
      if (error) {
        console.error("[getAllCategories] Error fetching categories, using fallback defaults:", error);
      }
      return DEFAULT_CATEGORIES;
    }

    return data as Category[];
  } catch (err) {
    console.error("[getAllCategories] Unexpected error, using fallback defaults:", err);
    return DEFAULT_CATEGORIES;
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

export async function getFeaturedArtworks(limit = HOMEPAGE_FEATURED_LIMIT): Promise<Artwork[]> {
  try {
    const supabase = getAnonClient();
    let { data, error } = await supabase
      .from("artworks")
      .select(`
        id, title, slug, description, price, original_price,
        category_id, is_featured, is_original, is_sold,
        dimensions, medium, created_at,
        category:categories ( id, name, slug ),
        artwork_images ( image_url, is_primary, display_order )
      `)
      .eq("is_available", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    // If no artworks are explicitly flagged is_featured (or query returned empty), fall back to latest available artworks
    if (!error && (!data || data.length === 0)) {
      const fallbackResult = await supabase
        .from("artworks")
        .select(`
          id, title, slug, description, price, original_price,
          category_id, is_featured, is_original, is_sold,
          dimensions, medium, created_at,
          category:categories ( id, name, slug ),
          artwork_images ( image_url, is_primary, display_order )
        `)
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error || !data) {
      console.error("Error fetching featured artworks:", error);
      return [];
    }

    return data.map((art) => ({
      ...mapArtwork(art),
      category: (art as Record<string, unknown>).category as Category | undefined,
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

    if (error || !data) {
      const fallback = DEFAULT_CATEGORIES.find((c) => c.id === id);
      return fallback || null;
    }
    return data as Category;
  } catch (err) {
    console.error("[getCategoryById] Unexpected error:", err);
    const fallback = DEFAULT_CATEGORIES.find((c) => c.id === id);
    return fallback || null;
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

    if (error || !data) {
      const fallback = DEFAULT_CATEGORIES.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
      );
      return fallback || null;
    }
    return data as Category;
  } catch (err) {
    console.error("[getCategoryBySlug] Unexpected error:", err);
    const fallback = DEFAULT_CATEGORIES.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase()
    );
    return fallback || null;
  }
}

export async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase.from("categories").select("slug");
    
    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES.map((c) => ({ slug: c.slug }));
    }
    return data as { slug: string }[];
  } catch (err) {
    console.error("[getAllCategorySlugs] Unexpected error:", err);
    return DEFAULT_CATEGORIES.map((c) => ({ slug: c.slug }));
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

