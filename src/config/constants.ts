import { siteConfig } from "@/config/site";

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
export const FALLBACK_ARTWORK_IMAGE = "/images/og-default.jpg";

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
  "received",
  "confirmed",
  "framing_packing",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  received: "Order Received",
  confirmed: "Order Confirmed",
  framing_packing: "Framing & Packing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CUSTOM_ORDER_STATUSES = [
  "submitted",
  "reviewed",
  "quoted",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_METHODS = [
  "upi_qr",
  "bank_transfer",
  "pay_on_dispatch",
  "razorpay",
] as const;

export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  upi_qr: "UPI / QR Code",
  bank_transfer: "Direct Bank Transfer (NEFT/IMPS)",
  pay_on_dispatch: "Pay on Dispatch (Advance Verification)",
  razorpay: "Razorpay (Cards, NetBanking, UPI)",
};

export const PAYMENT_STATUSES = [
  "pending",
  "receipt_uploaded",
  "verified",
  "paid",
  "failed",
  "refunded",
] as const;

export const PAYMENT_STATUS_LABELS: Record<(typeof PAYMENT_STATUSES)[number], string> = {
  pending: "Pending Payment",
  receipt_uploaded: "Receipt Uploaded (Verifying)",
  verified: "Payment Verified",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
};

export const COURIER_PARTNERS = [
  { name: "BlueDart", urlPrefix: "https://www.bluedart.com/tracking?track=" },
  { name: "Delhivery", urlPrefix: "https://www.delhivery.com/track/package/" },
  { name: "India Post", urlPrefix: "https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/tracking.aspx?trackingno=" },
  { name: "DTDC", urlPrefix: "https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=" },
  { name: "Other", urlPrefix: "" },
] as const;

export const BANK_DETAILS = {
  accountName: siteConfig.payment.bankDetails.beneficiaryName,
  bankName: siteConfig.payment.bankDetails.bankName,
  accountNumber: siteConfig.payment.bankDetails.accountNumber,
  ifscCode: siteConfig.payment.bankDetails.ifscCode,
  branch: siteConfig.payment.bankDetails.branch,
  address: siteConfig.payment.bankDetails.address,
  upiId: siteConfig.payment.upiId,
  upiPhone: siteConfig.phone,
};

// ---------- Type Exports ----------
export type ArtCategory = (typeof ART_CATEGORIES)[number];
export type ArtType = (typeof ART_TYPES)[number];
export type Surface = (typeof SURFACES)[number];
export type Medium = (typeof MEDIUMS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
