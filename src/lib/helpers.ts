/**
 * Format paise to INR display string.
 * e.g. 150000 → "₹1,500"
 */
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/**
 * Calculate discount percentage from MRP and selling price.
 */
export function getDiscountPercent(mrp: number, sellingPrice: number): number {
  if (mrp <= 0 || sellingPrice >= mrp) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a human-readable order number.
 * e.g. "AA-20260827-001"
 */
export function generateOrderNumber(prefix: string = "AA"): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 900 + 100).toString();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Format dimensions with unit.
 * e.g. formatDimensions(12, 16, "in") → "12 × 16 in"
 */
export function formatDimensions(
  width: number,
  height: number,
  unit: "in" | "cm" = "in"
): string {
  return `${width} × ${height} ${unit}`;
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Get human-readable label for enum values.
 * e.g. "mixed_media" → "Mixed Media"
 */
export function enumToLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format a date string to a human-readable format.
 * e.g. "2024-03-15T00:00:00Z" → "March 15, 2024"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
