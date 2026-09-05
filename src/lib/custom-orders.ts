export const ALL_CUSTOM_ORDER_STATUSES = [
  { value: "new", label: "New" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function formatStatusLabel(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "new":
    case "submitted":
      return "New / Submitted";
    case "reviewed":
      return "Reviewed";
    case "quoted":
      return "Quoted";
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  }
}

export function getStatusBadgeVariant(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "new":
    case "submitted":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "reviewed":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
    case "quoted":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
    case "accepted":
      return "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30";
    case "in_progress":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30";
    case "completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "cancelled":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

