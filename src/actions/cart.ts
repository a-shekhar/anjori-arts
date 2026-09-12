"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { MAX_CART_QUANTITY, FALLBACK_ARTWORK_IMAGE } from "@/config/constants";
import type { CartItem } from "@/stores/cart-store";

export interface CartActionResult {
  success: boolean;
  error?: string;
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
  price: number;
  is_available: boolean;
  images?: Array<{ url: string; alt: string; publicId?: string }> | null;
  variants?: RawVariantRow[] | null;
}

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    { db: { schema: "arts" } }
  );
}

/**
 * Fetch hydrated CartItem objects for the authenticated user from cloud database.
 */
export async function getUserCartItems(): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: cartRows, error: cartError } = await supabase
      .from("cart_items")
      .select("id, artwork_id, variant_id, is_framed, quantity, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (cartError || !cartRows || cartRows.length === 0) {
      return [];
    }

    const artworkIds = Array.from(new Set(cartRows.map((r) => r.artwork_id)));

    // Hydrate from artworks and artwork_variants
    const anon = getAnonClient();
    const { data: artworkData, error: artError } = await anon
      .from("artworks")
      .select(`
        id,
        slug,
        title,
        price,
        is_available,
        images,
        variants:artwork_variants(*)
      `)
      .in("id", artworkIds);

    if (artError || !artworkData) {
      console.error("[getUserCartItems] error fetching artworks:", artError);
      return [];
    }

    const artworkMap = new Map<string, RawArtworkRow>();
    (artworkData as unknown as RawArtworkRow[]).forEach((art) => {
      artworkMap.set(art.id, art);
    });

    const items: CartItem[] = [];

    for (const row of cartRows) {
      const art = artworkMap.get(row.artwork_id);
      if (!art) continue;

      const variant = (art.variants || []).find((v) => v.id === row.variant_id);
      const isFramed = Boolean(row.is_framed);

      const title = art.title;
      let imageUrl = FALLBACK_ARTWORK_IMAGE;
      if (Array.isArray(art.images) && art.images.length > 0 && art.images[0]?.url) {
        imageUrl = art.images[0].url;
      }

      let size = "Standard";
      let sellingPrice = art.price;
      let mrp = Math.round(art.price * 1.2);
      let framingPrice = 0;

      if (variant) {
        size = variant.label;
        sellingPrice = variant.selling_price;
        mrp = variant.mrp;
        framingPrice = isFramed && variant.can_be_framed ? (variant.framing_price || 0) : 0;
      }

      items.push({
        id: `${row.variant_id}-${isFramed ? "framed" : "unframed"}`,
        artworkId: art.id,
        slug: art.slug,
        variantId: row.variant_id,
        quantity: Math.min(MAX_CART_QUANTITY, Math.max(1, row.quantity)),
        isFramed,
        framingPrice,
        title,
        imageUrl,
        size,
        sellingPrice,
        mrp,
      });
    }

    return items;
  } catch (err) {
    console.error("[getUserCartItems] unexpected error:", err);
    return [];
  }
}

/**
 * Add or increment an item in the user's cloud cart.
 */
export async function addToCloudCart(payload: {
  artworkId: string;
  variantId: string;
  quantity: number;
  isFramed?: boolean;
}): Promise<CartActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const isFramed = Boolean(payload.isFramed);
    const addedQty = Math.max(1, payload.quantity);

    // Check existing
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("variant_id", payload.variantId)
      .eq("is_framed", isFramed)
      .maybeSingle();

    if (existing) {
      const newQty = Math.min(MAX_CART_QUANTITY, existing.quantity + addedQty);
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        artwork_id: payload.artworkId,
        variant_id: payload.variantId,
        is_framed: isFramed,
        quantity: Math.min(MAX_CART_QUANTITY, addedQty),
      });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[addToCloudCart] unexpected error:", err);
    return { success: false, error: "Failed to update cloud cart." };
  }
}

/**
 * Update quantity for a specific variant in the user's cloud cart.
 */
export async function updateCloudCartQuantity(
  variantId: string,
  isFramed: boolean,
  quantity: number
): Promise<CartActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    if (quantity <= 0) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("variant_id", variantId)
        .eq("is_framed", isFramed);

      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    const validQty = Math.min(MAX_CART_QUANTITY, quantity);
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: validQty,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("variant_id", variantId)
      .eq("is_framed", isFramed);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[updateCloudCartQuantity] unexpected error:", err);
    return { success: false, error: "Failed to update quantity." };
  }
}

/**
 * Remove an item from the user's cloud cart.
 */
export async function removeFromCloudCart(
  variantId: string,
  isFramed: boolean
): Promise<CartActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("variant_id", variantId)
      .eq("is_framed", isFramed);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[removeFromCloudCart] unexpected error:", err);
    return { success: false, error: "Failed to remove item." };
  }
}

/**
 * Clear all cart items for the authenticated user in the cloud database.
 */
export async function clearCloudCart(): Promise<CartActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[clearCloudCart] unexpected error:", err);
    return { success: false, error: "Failed to clear cloud cart." };
  }
}

/**
 * Auto-merges guest cart items from browser localStorage into cloud cart upon login.
 * Capped additively at MAX_CART_QUANTITY per item.
 * Returns the final unified hydrated list of cart items.
 */
export async function syncAndMergeCartAction(guestItems: CartItem[]): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return guestItems;
    }

    // 1. Fetch current cloud cart
    const { data: cloudRows, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, artwork_id, variant_id, is_framed, quantity")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("[syncAndMergeCartAction] error fetching cloud items:", fetchError);
      return guestItems;
    }

    const cloudMap = new Map<string, { id: string; quantity: number }>();
    (cloudRows || []).forEach((r) => {
      const key = `${r.variant_id}-${Boolean(r.is_framed) ? "framed" : "unframed"}`;
      cloudMap.set(key, { id: r.id, quantity: r.quantity });
    });

    // 2. Perform additive merge for guest items
    for (const item of guestItems) {
      const isFramed = Boolean(item.isFramed);
      const key = `${item.variantId}-${isFramed ? "framed" : "unframed"}`;
      const cloudItem = cloudMap.get(key);

      if (cloudItem) {
        const mergedQty = Math.min(MAX_CART_QUANTITY, cloudItem.quantity + item.quantity);
        if (mergedQty !== cloudItem.quantity) {
          await supabase
            .from("cart_items")
            .update({
              quantity: mergedQty,
              updated_at: new Date().toISOString(),
            })
            .eq("id", cloudItem.id);
        }
      } else {
        const initialQty = Math.min(MAX_CART_QUANTITY, Math.max(1, item.quantity));
        await supabase.from("cart_items").insert({
          user_id: user.id,
          artwork_id: item.artworkId,
          variant_id: item.variantId,
          is_framed: isFramed,
          quantity: initialQty,
        });
      }
    }

    // 3. Return full authoritative hydrated cart
    return await getUserCartItems();
  } catch (err) {
    console.error("[syncAndMergeCartAction] unexpected error:", err);
    return guestItems;
  }
}
