"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MAX_WISHLIST_ITEMS, FALLBACK_ARTWORK_IMAGE } from "@/config/constants";
import type { Artwork, ArtworkVariant } from "@/types";

export interface WishlistActionResult {
  success: boolean;
  error?: string;
  count?: number;
}

interface RawVariantRow {
  id: string;
  label: string;
  width_inches: number;
  height_inches: number;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
  can_be_framed?: boolean;
  framing_price?: number;
  sku?: string | null;
}

interface RawArtworkRow {
  id: string;
  slug: string;
  title: string;
  category_id: string;
  price: number;
  description?: string | null;
  dimensions?: string | null;
  surface?: { name?: string } | null;
  artwork_mediums?: Array<{ medium?: { name?: string } | null }> | null;
  is_available: boolean;
  is_featured: boolean;
  tags?: string[] | null;
  images?: Array<{ url: string; alt: string; publicId?: string }> | null;
  variants?: RawVariantRow[] | null;
  short_description?: string | null;
  artist_note?: string | null;
}

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    { db: { schema: "arts" } }
  );
}

function mapArtwork(art: RawArtworkRow): Artwork {
  const mediums =
    art.artwork_mediums
      ?.map((am) => am.medium?.name)
      .filter(Boolean)
      .join(", ") || "";

  const surfaceName = art.surface?.name || "";

  let images = art.images;
  if (!images || !Array.isArray(images) || images.length === 0) {
    images = [
      {
        url: FALLBACK_ARTWORK_IMAGE,
        alt: art.title || "Anjori Arts Handmade Artwork",
      },
    ];
  }

  const variants: ArtworkVariant[] = (art.variants || []).map((v) => ({
    id: v.id,
    label: v.label,
    widthInches: v.width_inches,
    heightInches: v.height_inches,
    mrp: v.mrp,
    sellingPrice: v.selling_price,
    stockQuantity: v.stock_quantity,
    isActive: v.is_active,
    canBeFramed: v.can_be_framed,
    framingPrice: v.framing_price,
    sku: v.sku,
  }));

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
    images,
    variants,
    shortDescription: art.short_description || "",
    artistNote: art.artist_note || "",
  };
}

/**
 * Fetch wishlisted artwork IDs for the current authenticated user.
 */
export async function getUserWishlistIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("wishlists")
      .select("artwork_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_WISHLIST_ITEMS);

    if (error) {
      return [];
    }

    return (data || []).map((row) => row.artwork_id);
  } catch (err) {
    console.error("[getUserWishlistIds] error:", err);
    return [];
  }
}

/**
 * Fetch full Artwork objects for the authenticated user's wishlist.
 */
export async function getUserWishlistArtworks(): Promise<Artwork[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: wishlistRows, error: wishlistError } = await supabase
      .from("wishlists")
      .select("artwork_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_WISHLIST_ITEMS);

    if (wishlistError || !wishlistRows || wishlistRows.length === 0) {
      return [];
    }

    const artworkIds = wishlistRows.map((r) => r.artwork_id);
    return await getArtworksByIds(artworkIds);
  } catch (err) {
    console.error("[getUserWishlistArtworks] error:", err);
    return [];
  }
}

/**
 * Fetch artworks by list of IDs (used for guest wishlists & cloud hydration).
 */
export async function getArtworksByIds(ids: string[]): Promise<Artwork[]> {
  if (!ids || ids.length === 0) return [];

  try {
    const supabase = getAnonClient();
    const validIds = ids.slice(0, MAX_WISHLIST_ITEMS);

    const { data, error } = await supabase
      .from("artworks")
      .select(`
        *,
        surface:surfaces(*),
        artwork_mediums(medium:mediums(*)),
        variants:artwork_variants(*)
      `)
      .in("id", validIds);

    if (error || !data) {
      console.error("[getArtworksByIds] error:", error);
      return [];
    }

    // Preserve the order of ids requested
    const artworkMap = new Map<string, Artwork>();
    (data as unknown as RawArtworkRow[]).forEach((item) => {
      artworkMap.set(item.id, mapArtwork(item));
    });

    return validIds
      .map((id) => artworkMap.get(id))
      .filter((art): art is Artwork => Boolean(art));
  } catch (err) {
    console.error("[getArtworksByIds] error:", err);
    return [];
  }
}

/**
 * Add an artwork to the authenticated user's cloud wishlist.
 */
export async function addToWishlistAction(artworkId: string): Promise<WishlistActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please sign in to save artworks to your account." };
    }

    // Check count against MAX_WISHLIST_ITEMS
    const { count, error: countError } = await supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!countError && typeof count === "number" && count >= MAX_WISHLIST_ITEMS) {
      return {
        success: false,
        error: `Wishlist limit reached. You can save up to ${MAX_WISHLIST_ITEMS} artworks.`,
        count,
      };
    }

    const { error: insertError } = await supabase.from("wishlists").insert({
      user_id: user.id,
      artwork_id: artworkId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return { success: true };
      }
      return { success: false, error: insertError.message };
    }

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save artwork.";
    console.error("[addToWishlistAction] error:", err);
    return { success: false, error: message };
  }
}

/**
 * Remove an artwork from the authenticated user's cloud wishlist.
 */
export async function removeFromWishlistAction(artworkId: string): Promise<WishlistActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please sign in to manage your wishlist." };
    }

    const { error: deleteError } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("artwork_id", artworkId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove artwork.";
    console.error("[removeFromWishlistAction] error:", err);
    return { success: false, error: message };
  }
}

/**
 * Auto-merges guest items from browser localStorage into cloud wishlist upon sign-in.
 * Returns the final unified list of artwork IDs.
 */
export async function syncAndMergeWishlistAction(guestArtworkIds: string[]): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return guestArtworkIds.slice(0, MAX_WISHLIST_ITEMS);

    // 1. Fetch current cloud wishlist
    const { data: cloudItems, error: fetchError } = await supabase
      .from("wishlists")
      .select("artwork_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return guestArtworkIds.slice(0, MAX_WISHLIST_ITEMS);
    }

    const cloudIdSet = new Set((cloudItems || []).map((r) => r.artwork_id));
    const mergedIds = Array.from(cloudIdSet);

    // 2. Identify new guest items to insert without exceeding MAX_WISHLIST_ITEMS
    const itemsToInsert: { user_id: string; artwork_id: string }[] = [];

    for (const gid of guestArtworkIds) {
      if (!cloudIdSet.has(gid) && mergedIds.length + itemsToInsert.length < MAX_WISHLIST_ITEMS) {
        itemsToInsert.push({
          user_id: user.id,
          artwork_id: gid,
        });
      }
    }

    // 3. Insert newly merged items
    if (itemsToInsert.length > 0) {
      await supabase.from("wishlists").insert(itemsToInsert);
      itemsToInsert.forEach((item) => mergedIds.unshift(item.artwork_id));
      revalidatePath("/account/wishlist");
    }

    return mergedIds.slice(0, MAX_WISHLIST_ITEMS);
  } catch (err) {
    console.error("[syncAndMergeWishlistAction] error:", err);
    return guestArtworkIds.slice(0, MAX_WISHLIST_ITEMS);
  }
}

