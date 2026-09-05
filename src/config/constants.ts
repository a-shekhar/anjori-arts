// ---------- Pricing ----------
/** GST rate as a decimal (e.g. 0.12 = 12%) */
export const GST_RATE = 0.12;

/** CGST = half of total GST */
export const CGST_RATE = GST_RATE / 2;

/** SGST = half of total GST */
export const SGST_RATE = GST_RATE / 2;

/**
 * Delivery charge in paise.
 * Set to 0 for promotional complimentary pan-India launch.
 * Easily swappable with backend dynamic pricing API.
 */
export const DELIVERY_CHARGE = 0;

/** Nominal delivery charge in paise for display comparison (₹150 = 15000) */
export const STANDARD_DELIVERY_CHARGE = 15000;

/** Free delivery threshold in paise (₹1500 = 150000) */
export const FREE_DELIVERY_THRESHOLD = 150000;

// ---------- Pagination ----------
export const SHOP_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
export const BLOG_PAGE_SIZE = 9;

// ---------- Limits ----------
export const MAX_CART_QUANTITY = 5;
export const MAX_ADDRESSES = 3;
export const MAX_CUSTOM_ORDER_IMAGES = 10;
export const MAX_REVIEW_IMAGES = 5;

// ---------- Image ----------
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ---------- Art Enums ----------
export const ART_CATEGORIES = [
  "paintings",
  "earrings",
  "wall_decor",
  "pooja_art",
  "gifts",
  "home_decor",
  "custom",
  "branding",
  "posters",
  "prints",
] as const;

export const ART_TYPES = [
  "madhubani",
  "tanjore",
  "warli",
  "pichwai",
  "pattachitra",
  "kalamkari",
  "gond",
  "mandala",
  "miniature",
  "contemporary",
  "classical",
  "folk",
  "resin_art",
  "abstract",
  "mythological",
  "devotional",
  "portraiture",
  "figurative",
  "logo_design",
  "cyanotype",
  "other",
] as const;

export const SURFACES = [
  "canvas",
  "teakwood",
  "handmade_paper",
  "silk",
  "terracotta_clay",
  "marble",
  "wood",
  "metal",
  "fabric",
  "tussar_silk",
  "mdf_wood",
  "glass",
  "other",
] as const;

export const MEDIUMS = [
  "oil",
  "acrylic",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refund_requested",
  "refunded",
] as const;

export const CUSTOM_ORDER_STATUSES = [
  "submitted",
  "reviewed",
  "quoted",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "created",
  "authorized",
  "captured",
  "failed",
  "refunded",
] as const;

// ---------- Type Exports ----------
export type ArtCategory = (typeof ART_CATEGORIES)[number];
export type ArtType = (typeof ART_TYPES)[number];
export type Surface = (typeof SURFACES)[number];
export type Medium = (typeof MEDIUMS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
