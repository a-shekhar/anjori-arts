"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  updateCustomOrderStatus,
  deleteCustomOrder,
} from "@/actions/admin-custom-orders";
import {
  formatStatusLabel,
  ALL_CUSTOM_ORDER_STATUSES,
} from "@/lib/custom-orders";
import { toast } from "sonner";
import type { CustomOrder } from "@/types";

interface CustomOrderDetailActionsProps {
  order: CustomOrder;
}

export function CustomOrderDetailActions({ order }: CustomOrderDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status.toLowerCase());

  const handleStatusUpdate = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    const toastId = toast.loading(`Updating status to ${formatStatusLabel(newStatus)}...`);
    try {
      const res = await updateCustomOrderStatus(order.id, newStatus);
      if (res.success) {
        toast.success("Order status updated successfully", { id: toastId });
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(`Error: ${res.message || "Failed to update"}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete custom order ${order.order_reference}? This action cannot be undone.`
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting custom order...");
    try {
      const res = await deleteCustomOrder(order.id);
      if (res.success) {
        toast.success("Order deleted", { id: toastId });
        router.push("/admin/custom-orders");
      } else {
        toast.error(`Error: ${res.message || "Failed to delete"}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to delete order", { id: toastId });
    }
  };

  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasQuote = Boolean(order.items && order.items.length > 0 && (order.quote_total || 0) > 0);

  const quoteBreakdown = hasQuote && order.items
    ? `\n\n*Quotation Breakdown:*\n` +
      order.items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.title}${item.description ? ` (${item.description})` : ""} — ${item.quantity} pc${item.quantity > 1 ? "s" : ""} × ${formatRupees(item.unitPrice)} = ${formatRupees(item.totalPrice)}`
        )
        .join("\n") +
      `\n\nTotal: ${formatRupees(order.quote_total || 0)}` +
      `\nAdvance Deposit (${order.deposit_percentage ?? 50}%): ${formatRupees(order.advance_deposit || 0)}` +
      `\nBalance on Completion: ${formatRupees(Math.max(0, (order.quote_total || 0) - (order.advance_deposit || 0)))}` +
      (order.estimated_timeline ? `\nEstimated Timeline: ${order.estimated_timeline}` : "")
    : "";

  // Pre-filled email text
  const emailSubject = encodeURIComponent(
    `Anjori Arts - Quotation & Details for Custom Order ${order.order_reference}`
  );
  const rawEmailBody =
    `Dear ${order.first_name},\n\n` +
    `Thank you for reaching out to Anjori Arts regarding your custom commission inquiry (${order.order_reference}).\n\n` +
    `We have reviewed your request for the ${order.final_category || order.category} artwork` +
    (order.final_size || order.preferred_size
      ? ` (${order.final_size || order.preferred_size})`
      : "") +
    `.\n` +
    (hasQuote
      ? quoteBreakdown.replace(/\*/g, "") +
        `\n\nPlease let us know if you would like to proceed with the commission or need any adjustments to the scope.`
      : `\n[Add Quotation / Timeline details here]`) +
    `\n\nWarm regards,\n` +
    `Anjori Arts Studio\n` +
    `www.anjoriarts.com`;

  const emailBody = encodeURIComponent(rawEmailBody);

  // Pre-filled WhatsApp message
  const cleanPhone = order.phone
    ? (order.country_code + order.phone).replace(/[^0-9]/g, "")
    : "";
  const rawWaMessage =
    `Hi ${order.first_name}, thank you for contacting Anjori Arts regarding your custom order commission (${order.order_reference}). ` +
    (hasQuote
      ? `We have prepared your quotation for ${order.final_category || order.category}:${quoteBreakdown}\n\nPlease let us know if you would like to proceed with this commission!`
      : `We have reviewed your request for ${order.category} art and would love to discuss the details.`);

  const waMessage = encodeURIComponent(rawWaMessage);
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

  const quoteDraftText =
    `Hi ${order.first_name},\n\n` +
    `Thank you for your custom artwork request (${order.order_reference}) for ${order.final_category || order.category}.\n` +
    (hasQuote
      ? quoteBreakdown.replace(/\*/g, "") +
        `\n\nPlease let us know if you would like to proceed with the commission.`
      : `We have reviewed your specifications and would like to provide an initial quote and timeline.`) +
    `\n\nBest regards,\nAnjori Arts Studio`;

  const copyQuoteTemplate = async () => {
    try {
      await navigator.clipboard.writeText(quoteDraftText);
      setCopiedTemplate(true);
      toast.success("Template copied to clipboard");
      setTimeout(() => setCopiedTemplate(false), 2500);
    } catch {
      toast.error("Failed to copy template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Management Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Order Status
          </CardTitle>
          <CardDescription className="text-xs">
            Change the current lifecycle state of this commission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedStatus}
              onValueChange={(val) => val && handleStatusUpdate(val)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full text-sm font-medium">
                <SelectValue>{formatStatusLabel(selectedStatus)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ALL_CUSTOM_ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Updating the status will immediately reflect across admin lists and metrics.
          </p>
        </CardContent>
      </Card>

      {/* Customer Direct Contact Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Contact Client
          </CardTitle>
          <CardDescription className="text-xs">
            {hasQuote
              ? "Drafts prefilled with itemized quote & deposit."
              : "Start a direct conversation with the client."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                className:
                  "w-full justify-start text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10",
              })}
            >
              <Phone className="mr-2 h-4 w-4" />
              Chat on WhatsApp
            </a>
          ) : (
            <Button variant="outline" disabled className="w-full justify-start text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              No Phone Number Provided
            </Button>
          )}

          <a
            href={`mailto:${order.email}?subject=${emailSubject}&body=${emailBody}`}
            className={buttonVariants({
              variant: "outline",
              className: "w-full justify-start",
            })}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email Inquiry
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyQuoteTemplate}
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
          >
            {copiedTemplate ? (
              <Check className="mr-2 h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="mr-2 h-3.5 w-3.5" />
            )}
            {copiedTemplate ? "Copied template!" : "Copy response draft"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="w-full text-xs"
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Custom Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
