"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAX_WISHLIST_ITEMS } from "@/config/constants";
import type { Artwork } from "@/types";
import { mapArtwork } from "@/lib/mappers";
import { getAnonClient } from "@/lib/supabase/anon";

export interface WishlistActionResult {
  success: boolean;
  error?: string;
  count?: number;
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
    (data as any[]).forEach((item) => {
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

