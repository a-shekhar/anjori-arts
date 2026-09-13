import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/custom-orders";
import type { OrderStatus, PaymentStatus } from "@/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  switch (status) {
    case "pending_verification":
      return (
        <Badge
          className={cn(
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium",
            className
          )}
        >
          Pending Verification
        </Badge>
      );
    case "in_framing_packing":
      return (
        <Badge
          className={cn(
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 font-medium",
            className
          )}
        >
          In Framing & Packing
        </Badge>
      );
    case "dispatched":
      return (
        <Badge
          className={cn(
            "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 font-medium",
            className
          )}
        >
          Dispatched
        </Badge>
      );
    case "delivered":
      return (
        <Badge className={cn("bg-emerald-600 text-white font-medium", className)}>
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          className={cn(
            "bg-destructive/10 text-destructive border-destructive/20 font-medium",
            className
          )}
        >
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status ? status.replace(/_/g, " ") : "Unknown"}
        </Badge>
      );
  }
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus | string;
  className?: string;
}) {
  switch (status) {
    case "paid":
      return (
        <Badge
          className={cn(
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium",
            className
          )}
        >
          Paid
        </Badge>
      );
    case "payment_submitted":
      return (
        <Badge
          className={cn(
            "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 font-medium",
            className
          )}
        >
          Verification In Progress
        </Badge>
      );
    case "pending":
      return (
        <Badge
          className={cn(
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium",
            className
          )}
        >
          Payment Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge
          className={cn(
            "bg-destructive/10 text-destructive border-destructive/20 font-medium",
            className
          )}
        >
          Failed
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="secondary" className={cn("font-medium", className)}>
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}

export function CustomOrderStatusBadge({ status, className }: StatusBadgeProps) {
  const label = formatStatusLabel(status);
  const variantClass = getStatusBadgeVariant(status);
  return (
    <Badge className={cn("font-medium", variantClass, className)}>
      {label}
    </Badge>
  );
}

