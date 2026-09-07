import type { Inquiry, InquiryStatus } from "@/types";

export const ALL_INQUIRY_STATUSES: Array<{ value: InquiryStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

export const INQUIRY_CATEGORIES = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Order Status", label: "Order Status / Tracking" },
  { value: "Custom Artwork", label: "Custom Artwork Request" },
  { value: "Collaboration", label: "Collaboration / Partnership" },
  { value: "Feedback", label: "Feedback" },
  { value: "Other", label: "Other" },
] as const;

export function formatInquiryCategory(category: string): string {
  const match = INQUIRY_CATEGORIES.find(
    (c) => c.value.toLowerCase() === (category || "").trim().toLowerCase()
  );
  return match ? match.label : category;
}

export function formatInquiryStatus(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "new":
      return "New";
    case "reviewed":
      return "Reviewed";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "archived":
      return "Archived";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  }
}

export function getInquiryStatusBadgeVariant(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "new":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "reviewed":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "in_progress":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30";
    case "resolved":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "archived":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * Generates a pre-filled WhatsApp click-to-chat URL for an inquiry.
 */
export function buildInquiryWhatsAppUrl(inquiry: Inquiry): string | null {
  if (!inquiry.phone) return null;

  // Clean country code & phone: strip spaces, dashes, parentheses
  const code = (inquiry.country_code || "+91").replace(/[^\d+]/g, "").replace(/^\+/, "");
  const phoneDigits = inquiry.phone.replace(/\D/g, "");
  if (!phoneDigits) return null;

  const fullNumber = `${code}${phoneDigits}`;
  const message = `Hello ${inquiry.first_name}, thank you for reaching out to Anjori Arts regarding your inquiry (${inquiry.inquiry_reference} - "${inquiry.subject}").`;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a pre-filled mailto URL for an inquiry response.
 */
export function buildInquiryMailtoUrl(inquiry: Inquiry): string {
  const subject = `Re: [${inquiry.inquiry_reference}] ${inquiry.subject}`;
  const body = `Hi ${inquiry.first_name},\n\nThank you for reaching out to Anjori Arts regarding your inquiry.\n\n---\nOriginal Message:\n"${inquiry.message}"\n---\n\nBest regards,\nAnjori Arts Team`;

  return `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
