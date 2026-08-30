"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Artwork, Category } from "@/data/dummy";

function mapArtwork(art: any): Artwork {
  const mediums = art.artwork_mediums
    ?.map((am: any) => am.medium?.name)
    .filter(Boolean)
    .join(", ") || "";

  const surfaceName = art.surface?.name || "";

  let images = art.images;
  if (!images || !Array.isArray(images) || images.length === 0) {
    images = [
      {
        url: "https://images.unsplash.com/photo-1579541513287-3f17a5ccc4e1?q=80&w=800&auto=format&fit=crop",
        alt: art.title,
      }
    ];
  }

  return {
    id: art.id,
    slug: art.slug,
    title: art.title,
    categoryId: art.category_id,
    price: art.price,
    description: art.description || "",
    dimensions: art.dimensions || "",
    surface: surfaceName,
    medium: mediums,
    isAvailable: art.is_available,
    isFeatured: art.is_featured,
    tags: art.tags || [],
    images: images,
    variants: art.variants || [],
    shortDescription: art.short_description || "",
    artistNote: art.artist_note || "",
  } as Artwork;
}

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    { db: { schema: "arts" } }
  );
}

export async function getShopData(): Promise<{ artworks: Artwork[]; categories: Category[] }> {
  const supabase = getAnonClient();

  // Fetch categories
  const { data: categoriesData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (catError) {
    console.error("Error fetching categories:", catError);
    throw new Error("Failed to fetch categories");
  }

  // Fetch artworks with relations
  const { data: artworksData, error: artError } = await supabase
    .from("artworks")
    .select(`
      *,
      surface:surfaces(*),
      artwork_mediums(medium:mediums(*)),
      variants:artwork_variants(*)
    `)
    .order("created_at", { ascending: false });

  if (artError) {
    console.error("Error fetching artworks:", artError);
    throw new Error("Failed to fetch artworks");
  }

  const artworks = artworksData.map(mapArtwork);

  return {
    artworks,
    categories: categoriesData as Category[],
  };
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
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
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Category;
}

export async function getRelatedArtworks(categoryId: string, excludeId: string): Promise<Artwork[]> {
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
}

export async function getAllArtworkSlugs(): Promise<{ slug: string }[]> {
  const supabase = getAnonClient();
  const { data, error } = await supabase.from("artworks").select("slug");
  
  if (error || !data) {
    return [];
  }
  
  return data as { slug: string }[];
}

