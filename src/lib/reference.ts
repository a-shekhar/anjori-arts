export type ReferencePrefix = "CUS" | "ART" | "INQ";

/**
 * 32 unambiguous characters excluding '0', '1', 'I', and 'O'
 * to avoid misreading on printed receipts, mobile screens, or invoices.
 * Length is exactly 32 (2^5), enabling zero-bias uniform sampling from random bytes.
 */
export const UNAMBIGUOUS_ALPHANUMERIC_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates an unambiguous random alphanumeric suffix of specified length.
 * Defaults to 6 characters.
 *
 * Uses `globalThis.crypto.getRandomValues` for 100% isomorphic support across
 * Node.js, Edge runtime, Server Actions, and browser environments.
 */
export function generateReferenceSuffix(length: number = 6): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);

  let suffix = "";
  for (let i = 0; i < length; i++) {
    // 32 characters allows bitwise mask (& 31) with zero modulo bias (256 is divisible by 32)
    const index = bytes[i] & 31;
    suffix += UNAMBIGUOUS_ALPHANUMERIC_CHARS[index];
  }
  return suffix;
}

/**
 * Generates a standardized reference code in the format:
 * `PREFIX-YYYY-XXXXXX`
 *
 * Examples:
 * - Custom Order: `CUS-2026-9K2MPX`
 * - Artwork Order: `ART-2026-9K2MPX`
 * - Inquiry: `INQ-2026-9K2MPX`
 */
export function generateReferenceCode(
  prefix: ReferencePrefix,
  year: number = new Date().getFullYear(),
  suffixLength: number = 6
): string {
  const suffix = generateReferenceSuffix(suffixLength);
  return `${prefix}-${year}-${suffix}`;
}

/**
 * Validates whether a given string matches the standard reference format:
 * `(CUS|ART|INQ)-YYYY-XXXXXX` (using unambiguous characters).
 */
export function isValidReferenceCode(code: string): boolean {
  return /^(CUS|ART|INQ)-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code);
}

