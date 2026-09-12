import { createAdminClient } from "@/lib/supabase/admin";
import { DELIVERY_CHARGE } from "@/config/constants";
import type { CartItem } from "@/types";

export interface AuthoritativeOrderItem {
  artwork_id: string | null;
  variant_id: string | null;
  title: string;
  image_url: string | null;
  size: string;
  is_framed: boolean;
  framing_price: number;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface AuthoritativeOrderCalculation {
  success: boolean;
  error?: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  orderItemsToInsert: AuthoritativeOrderItem[];
}

interface DbVariantRecord {
  id: string;
  artwork_id: string;
  label: string;
  selling_price: number;
  mrp: number;
  stock_quantity: number;
  is_active: boolean;
  can_be_framed: boolean;
  framing_price: number;
  sku: string | null;
  artwork:
    | {
        id: string;
        title: string;
        price: number;
        is_available: boolean;
        images: Array<{ url: string; alt?: string }> | null;
      }
    | Array<{
        id: string;
        title: string;
        price: number;
        is_available: boolean;
        images: Array<{ url: string; alt?: string }> | null;
      }>
    | null;
}

interface DbArtworkRecord {
  id: string;
  title: string;
  price: number;
  is_available: boolean;
  images: Array<{ url: string; alt?: string }> | null;
}

/**
 * Validates cart items against the authoritative database records in Supabase.
 * Checks availability, stock quantities, and calculates the exact price in paise.
 * Prevents client-side price tampering.
 */
export async function calculateAuthoritativeOrder(
  items: CartItem[]
): Promise<AuthoritativeOrderCalculation> {
  if (!items || items.length === 0) {
    return {
      success: false,
      error: "Your shopping bag is empty.",
      subtotal: 0,
      deliveryCharge: 0,
      discountAmount: 0,
      totalAmount: 0,
      orderItemsToInsert: [],
    };
  }

  const supabase = createAdminClient();

  const isUuid = (val?: string | null): val is string =>
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

  const candidateVariantIds = Array.from(
    new Set(items.map((i) => i.variantId).filter(isUuid))
  );

  const variantMap = new Map<string, DbVariantRecord>();
  if (candidateVariantIds.length > 0) {
    const { data: dbVariants, error: variantsError } = await supabase
      .from("artwork_variants")
      .select(`
        id,
        artwork_id,
        label,
        selling_price,
        mrp,
        stock_quantity,
        is_active,
        can_be_framed,
        framing_price,
        sku,
        artwork:artworks(id, title, price, is_available, images)
      `)
      .in("id", candidateVariantIds);

    if (variantsError) {
      console.error("[calculateAuthoritativeOrder] Error fetching artwork variants:", variantsError);
      return {
        success: false,
        error: "Unable to verify artwork pricing. Please try again.",
        subtotal: 0,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 0,
        orderItemsToInsert: [],
      };
    }

    if (dbVariants) {
      for (const v of dbVariants) {
        variantMap.set(v.id, v as unknown as DbVariantRecord);
      }
    }
  }

  const missingArtworkIds = Array.from(
    new Set(
      items
        .filter((i) => !variantMap.has(i.variantId))
        .map((i) => i.artworkId || i.variantId)
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    )
  );

  const artworkMap = new Map<string, DbArtworkRecord>();
  if (missingArtworkIds.length > 0) {
    const { data: dbArtworks, error: artworksError } = await supabase
      .from("artworks")
      .select("id, title, price, is_available, images")
      .in("id", missingArtworkIds);

    if (artworksError) {
      console.error("[calculateAuthoritativeOrder] Error fetching artworks:", artworksError);
      return {
        success: false,
        error: "Unable to verify artwork pricing. Please try again.",
        subtotal: 0,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 0,
        orderItemsToInsert: [],
      };
    }

    if (dbArtworks) {
      for (const a of dbArtworks) {
        artworkMap.set(a.id, a as unknown as DbArtworkRecord);
      }
    }
  }

  let subtotal = 0;
  const orderItemsToInsert: AuthoritativeOrderItem[] = [];

  for (const item of items) {
    const quantity = Math.max(1, Math.min(5, Math.floor(Number(item.quantity) || 1)));

    let unitPrice: number;
    let framingPrice = 0;
    let isFramed = false;
    let title = item.title;
    let imageUrl: string | null = item.imageUrl || null;
    let size = item.size || "Standard";
    let artworkId: string | null = null;
    let variantId: string | null = null;

    const variant = variantMap.get(item.variantId);

    if (variant) {
      const art = Array.isArray(variant.artwork) ? variant.artwork[0] : variant.artwork;

      if (variant.is_active === false || art?.is_available === false) {
        return {
          success: false,
          error: `"${art?.title || item.title}" (${variant.label}) is currently unavailable.`,
          subtotal: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          totalAmount: 0,
          orderItemsToInsert: [],
        };
      }

      if (variant.stock_quantity !== null && variant.stock_quantity < quantity) {
        return {
          success: false,
          error: `"${art?.title || item.title}" (${variant.label}) has only ${variant.stock_quantity} in stock.`,
          subtotal: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          totalAmount: 0,
          orderItemsToInsert: [],
        };
      }

      unitPrice = Number(variant.selling_price);
      if (item.isFramed && variant.can_be_framed) {
        isFramed = true;
        framingPrice = Number(variant.framing_price) || 0;
      } else {
        isFramed = false;
        framingPrice = 0;
      }

      artworkId = variant.artwork_id || art?.id || item.artworkId || null;
      variantId = variant.id;
      size = variant.label;
      title = art?.title || item.title;

      const artworkImages = art?.images;
      if (Array.isArray(artworkImages) && artworkImages.length > 0 && artworkImages[0]?.url) {
        imageUrl = artworkImages[0].url;
      }
    } else {
      const artwork = artworkMap.get(item.artworkId) || artworkMap.get(item.variantId);
      if (!artwork) {
        return {
          success: false,
          error: `Artwork "${item.title}" could not be verified in the catalog.`,
          subtotal: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          totalAmount: 0,
          orderItemsToInsert: [],
        };
      }

      if (!artwork.is_available) {
        return {
          success: false,
          error: `"${artwork.title}" is currently unavailable.`,
          subtotal: 0,
          deliveryCharge: 0,
          discountAmount: 0,
          totalAmount: 0,
          orderItemsToInsert: [],
        };
      }

      unitPrice = Number(artwork.price);
      isFramed = false;
      framingPrice = 0;
      artworkId = artwork.id;
      variantId = null;
      title = artwork.title || item.title;

      if (Array.isArray(artwork.images) && artwork.images.length > 0 && artwork.images[0]?.url) {
        imageUrl = artwork.images[0].url;
      }
    }

    // Security check: Guard against client-side price tampering
    if (typeof item.sellingPrice === "number" && item.sellingPrice !== unitPrice) {
      console.warn(`[calculateAuthoritativeOrder] Security: Price discrepancy for "${title}": client=${item.sellingPrice}, db=${unitPrice}`);
      return {
        success: false,
        error: `Price discrepancy detected for "${title}". Please refresh your bag before placing your order.`,
        subtotal: 0,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 0,
        orderItemsToInsert: [],
      };
    }

    if (item.isFramed && typeof item.framingPrice === "number" && item.framingPrice !== framingPrice) {
      console.warn(`[calculateAuthoritativeOrder] Security: Framing price discrepancy for "${title}": client=${item.framingPrice}, db=${framingPrice}`);
      return {
        success: false,
        error: `Framing price discrepancy detected for "${title}". Please refresh your bag before placing your order.`,
        subtotal: 0,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 0,
        orderItemsToInsert: [],
      };
    }

    const lineTotal = (unitPrice + framingPrice) * quantity;
    subtotal += lineTotal;

    orderItemsToInsert.push({
      artwork_id: artworkId,
      variant_id: variantId,
      title,
      image_url: imageUrl,
      size,
      is_framed: isFramed,
      framing_price: framingPrice,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
    });
  }

  const deliveryCharge = DELIVERY_CHARGE;
  const discountAmount = 0;
  const totalAmount = subtotal + deliveryCharge - discountAmount;

  return {
    success: true,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    orderItemsToInsert,
  };
}

