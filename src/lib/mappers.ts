import type {
  Artwork,
  ArtworkVariant,
  Order,
  OrderItem,
  CustomOrder,
  CustomOrderItem,
  PaymentStatus,
  OrderStatus,
  CustomOrderStatus,
} from "@/types";
import { FALLBACK_ARTWORK_IMAGE, DEFAULT_COUNTRY_CODE } from "@/config/constants";

/**
 * Normalizes a raw artwork database row into a strictly typed Artwork object.
 */
export function mapArtwork(art: any): Artwork {
  const mediums =
    art.artwork_mediums
      ?.map((am: any) => am.medium?.name)
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

  const variants: ArtworkVariant[] = (art.variants || []).map((v: any) => ({
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
  } as Artwork;
}

/**
 * Normalizes a raw order database row into a strictly typed Order object.
 */
export function mapOrder(order: any, items: OrderItem[] = []): Order {
  return {
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id ?? null,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    country_code: order.country_code || DEFAULT_COUNTRY_CODE,
    shipping_address: order.shipping_address || {},
    delivery_instructions: order.delivery_instructions ?? null,
    subtotal: Number(order.subtotal) || 0,
    delivery_charge: Number(order.delivery_charge) || 0,
    discount_amount: Number(order.discount_amount) || 0,
    total_amount: Number(order.total_amount) || 0,
    currency: order.currency || "INR",
    payment_method: order.payment_method,
    payment_status: order.payment_status as PaymentStatus,
    payment_reference: order.payment_reference ?? null,
    receipt_url: order.receipt_url ?? null,
    order_status: order.order_status as OrderStatus,
    courier_name: order.courier_name ?? null,
    tracking_number: order.tracking_number ?? null,
    tracking_url: order.tracking_url ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    admin_notes: order.admin_notes ?? null,
    gateway_order_id: order.gateway_order_id ?? null,
    paid_at: order.paid_at ?? null,
    cancellation_reason: order.cancellation_reason ?? null,
    refund_reference: order.refund_reference ?? null,
    refund_amount: Number(order.refund_amount) || 0,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items,
  };
}

/**
 * Normalizes a raw custom order database row into a strictly typed CustomOrder object.
 */
export function mapCustomOrder(order: any): CustomOrder {
  return {
    id: order.id,
    user_id: order.user_id ?? null,
    order_reference: order.order_reference,
    status: (order.status as CustomOrderStatus) || "new",
    created_at: order.created_at,
    first_name: order.first_name,
    last_name: order.last_name,
    email: order.email,
    country_code: order.country_code || DEFAULT_COUNTRY_CODE,
    phone: order.phone ?? null,
    category: order.category ?? null,
    medium: order.medium ?? null,
    surface: order.surface ?? null,
    preferred_size: order.preferred_size ?? null,
    budget: order.budget ?? null,
    reference_link: order.reference_link ?? null,
    reference_images: Array.isArray(order.reference_images) ? order.reference_images : [],
    message: order.message ?? null,
    final_category: order.final_category ?? null,
    final_medium: order.final_medium ?? null,
    final_surface: order.final_surface ?? null,
    final_size: order.final_size ?? null,
    final_budget: order.final_budget ?? null,
    items: Array.isArray(order.items) ? (order.items as CustomOrderItem[]) : [],
    quote_total: typeof order.quote_total === "number" ? order.quote_total : Number(order.quote_total) || 0,
    deposit_percentage:
      typeof order.deposit_percentage === "number"
        ? order.deposit_percentage
        : Number(order.deposit_percentage) || 50,
    advance_deposit:
      typeof order.advance_deposit === "number"
        ? order.advance_deposit
        : Number(order.advance_deposit) || 0,
    estimated_timeline: order.estimated_timeline ?? null,
    admin_notes: order.admin_notes ?? null,
  };
}
