"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Building2,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/helpers";
import {
  COURIER_PARTNERS,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/config/constants";
import {
  updateAdminOrderStatus,
  updateAdminCourierTracking,
  verifyAdminPayment,
} from "@/actions/admin-orders";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

interface AdminOrderDetailViewProps {
  initialOrder: Order;
}

export function AdminOrderDetailView({ initialOrder }: AdminOrderDetailViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isPending, startTransition] = useTransition();

  // Courier state
  const [courierName, setCourierName] = useState(order.courier_name || "BlueDart");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimated_delivery || "");
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Payment verification state
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [utrReference, setUtrReference] = useState(order.payment_reference || "");
  const [refundReference, setRefundReference] = useState(order.refund_reference || "");
  const [refundAmount, setRefundAmount] = useState(
    order.refund_amount ? (order.refund_amount / 100).toString() : ""
  );

  // Cancellation state
  const [cancellationReason, setCancellationReason] = useState(order.cancellation_reason || "");

  // Notes state
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");

  // Receipt Modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Status transitions
  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      const res = await updateAdminOrderStatus(
        order.id,
        newStatus,
        adminNotes,
        cancellationReason.trim() || undefined
      );
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          order_status: newStatus,
          cancellation_reason: cancellationReason.trim() || prev.cancellation_reason,
        }));
        toast.success(`Order moved to ${ORDER_STATUS_LABELS[newStatus]}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update order status.");
      }
    });
  };

  // Payment verification
  const handleVerifyPayment = () => {
    startTransition(async () => {
      const refundPaise = refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined;
      const res = await verifyAdminPayment(
        order.id,
        selectedPaymentStatus,
        utrReference.trim() || undefined,
        selectedPaymentStatus === "refunded"
          ? {
              refundReference: refundReference.trim() || undefined,
              refundAmount: refundPaise,
            }
          : undefined
      );
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          payment_status: selectedPaymentStatus,
          payment_reference: utrReference.trim() || prev.payment_reference,
          paid_at:
            selectedPaymentStatus === "verified" || selectedPaymentStatus === "paid"
              ? prev.paid_at || new Date().toISOString()
              : prev.paid_at,
          refund_reference:
            selectedPaymentStatus === "refunded"
              ? refundReference.trim() || prev.refund_reference
              : prev.refund_reference,
          refund_amount:
            selectedPaymentStatus === "refunded" && refundPaise !== undefined
              ? refundPaise
              : prev.refund_amount,
          order_status:
            selectedPaymentStatus === "verified" || selectedPaymentStatus === "paid"
              ? prev.order_status === "received"
                ? "confirmed"
                : prev.order_status
              : prev.order_status,
        }));
        toast.success(`Payment updated to ${PAYMENT_STATUS_LABELS[selectedPaymentStatus]}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update payment.");
      }
    });
  };

  // Courier tracking update
  const handleSaveTracking = () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number.");
      return;
    }

    startTransition(async () => {
      const res = await updateAdminCourierTracking(order.id, {
        courierName,
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim() || undefined,
        estimatedDelivery: estimatedDelivery.trim() || undefined,
        autoAdvanceStatus: autoAdvance,
      });

      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          courier_name: courierName,
          tracking_number: trackingNumber.trim(),
          tracking_url: trackingUrl.trim() || prev.tracking_url,
          estimated_delivery: estimatedDelivery.trim() || prev.estimated_delivery,
          order_status: autoAdvance ? "dispatched" : prev.order_status,
        }));
        toast.success("Courier tracking updated successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update courier tracking.");
      }
    });
  };

  // Auto-generate tracking URL when partner or number changes
  const handleCourierChange = (partnerName: string) => {
    setCourierName(partnerName);
    if (trackingNumber.trim()) {
      const partner = COURIER_PARTNERS.find((c) => c.name === partnerName);
      if (partner && partner.urlPrefix) {
        setTrackingUrl(`${partner.urlPrefix}${encodeURIComponent(trackingNumber.trim())}`);
      }
    }
  };

  const handleTrackingNumberChange = (num: string) => {
    setTrackingNumber(num);
    const partner = COURIER_PARTNERS.find((c) => c.name === courierName);
    if (partner && partner.urlPrefix) {
      setTrackingUrl(`${partner.urlPrefix}${encodeURIComponent(num.trim())}`);
    }
  };

  // WhatsApp quick link for admin
  const customerPhoneClean = order.customer_phone.replace(/\D/g, "");
  const whatsappCustomerLink = `https://wa.me/${order.country_code.replace("+", "")}${customerPhoneClean}?text=${encodeURIComponent(
    `Hello ${order.customer_name}, regards from Anjori Arts regarding your order #${order.order_number}.`
  )}`;

  const orderDateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Order #{order.order_number}
            </h1>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {orderDateStr}
            </span>
          </div>
        </div>

        {/* Quick Customer Contact Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={whatsappCustomerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-600/20"
          >
            <MessageCircle className="size-3.5 text-emerald-600" />
            <span>WhatsApp Collector</span>
          </a>

          <a
            href={`tel:${order.country_code}${customerPhoneClean}`}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Phone className="size-3.5 text-primary" />
            <span>Call</span>
          </a>

          <a
            href={`mailto:${order.customer_email}`}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Mail className="size-3.5 text-primary" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* FULFILLMENT PIPELINE STEPPER WORKBENCH */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fulfillment Stage Control
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ORDER_STATUSES.map((statusKey) => {
            const isCurrent = order.order_status === statusKey;
            return (
              <button
                key={statusKey}
                type="button"
                disabled={isPending || isCurrent}
                onClick={() => handleStatusChange(statusKey)}
                className={`flex min-h-[38px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary ring-offset-2 ring-offset-card cursor-default"
                    : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isCurrent && <CheckCircle2 className="size-3.5" />}
                <span>{ORDER_STATUS_LABELS[statusKey]}</span>
              </button>
            );
          })}
        </div>

        {/* Cancellation Reason if Cancelled */}
        {order.order_status === "cancelled" && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-destructive">
              <AlertTriangle className="size-4" />
              <span>Order Cancelled</span>
            </div>
            {order.cancellation_reason ? (
              <p className="mt-1 text-muted-foreground">
                <span className="font-medium text-foreground">Reason: </span>
                {order.cancellation_reason}
              </p>
            ) : null}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Specify or update cancellation reason..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[36px] flex-1 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStatusChange("cancelled")}
                className="rounded-lg bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
              >
                Save Reason
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Artworks & Collector Destination */}
        <div className="space-y-8 lg:col-span-7 xl:col-span-8">
          {/* Itemized Artworks */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Artworks in Order ({order.items?.length || 0})
            </h2>

            <div className="mt-4 divide-y divide-border/70">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Package className="size-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Size: <strong>{item.size}</strong> • Finish:{" "}
                        <span className={item.is_framed ? "text-primary font-medium" : ""}>
                          {item.is_framed ? `Framed (+${formatPrice(item.framing_price)})` : "Unframed"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(item.line_total)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPrice(item.unit_price + item.framing_price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="mt-4 border-t border-border/80 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Artwork Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Insured Packaging &amp; Shipping</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {order.delivery_charge === 0 ? "FREE" : formatPrice(order.delivery_charge)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-sm sm:text-base text-foreground">
                <span>Total Order Value</span>
                <span className="font-serif">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </section>

          {/* Collector & Shipping Details */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Delivery Destination &amp; Collector Notes
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  Recipient Address
                </span>
                <p className="font-semibold text-foreground text-sm pt-1">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.shipping_address.street}</p>
                {order.shipping_address.landmark && (
                  <p className="text-muted-foreground">Landmark: {order.shipping_address.landmark}</p>
                )}
                <p className="text-foreground font-medium">
                  {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                  <span className="font-mono">{order.shipping_address.pincode}</span>
                </p>
                <p className="text-muted-foreground">{order.shipping_address.country || "India"}</p>
              </div>

              <div className="space-y-2">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  Contact &amp; Instructions
                </span>
                <p className="text-muted-foreground">
                  Phone:{" "}
                  <strong className="text-foreground">
                    {order.country_code} {order.customer_phone}
                  </strong>
                </p>
                <p className="text-muted-foreground">
                  Email: <strong className="text-foreground">{order.customer_email}</strong>
                </p>
                {order.delivery_instructions && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-amber-900 dark:text-amber-200">
                    <span className="font-semibold block mb-0.5">Special Instructions:</span>
                    &ldquo;{order.delivery_instructions}&rdquo;
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Admin Internal Notes */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Studio Internal Notes
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStatusChange(order.order_status)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Save className="size-3.5 text-primary" />
                <span>Save Notes</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. Framed in teakwood border with acid-free backing. Ready for BlueDart pickup on Thursday."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </section>
        </div>

        {/* RIGHT COLUMN: Payment Verification & Courier Tracking */}
        <div className="space-y-8 lg:col-span-5 xl:col-span-4">
          {/* PAYMENT VERIFICATION MODULE */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Payment Verification
              </h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Gateway Order ID if available */}
              {order.gateway_order_id && (
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider">
                      Gateway Order ID
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.gateway_order_id!, "Gateway Order ID")}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      {copiedKey === "Gateway Order ID" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>{copiedKey === "Gateway Order ID" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-xs font-semibold text-foreground">
                    {order.gateway_order_id}
                  </p>
                </div>
              )}

              {/* Paid At Timestamp if available */}
              {order.paid_at && (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs">
                  <span className="text-muted-foreground font-medium">Payment Timestamp</span>
                  <span className="font-semibold text-foreground">
                    {new Date(order.paid_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="receipt_uploaded">Receipt Uploaded (Requires Verification)</option>
                  <option value="verified">Verified (Approved)</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Transaction Reference / UTR / Gateway ID
                  </label>
                  {utrReference && (
                    <button
                      type="button"
                      onClick={() => handleCopy(utrReference, "Transaction Reference")}
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                    >
                      {copiedKey === "Transaction Reference" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>{copiedKey === "Transaction Reference" ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 423819028192 or Razorpay ID"
                  value={utrReference}
                  onChange={(e) => setUtrReference(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Refund Details Panel when status is Refunded */}
              {selectedPaymentStatus === "refunded" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
                  <span className="block font-semibold text-[11px] text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Refund Audit Details
                  </span>
                  <div>
                    <label className="block text-[11px] font-medium text-foreground">
                      Refund Reference (Razorpay rfnd_... or bank UTR)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. rfnd_EKwxwAgItmmXdp"
                      value={refundReference}
                      onChange={(e) => setRefundReference(e.target.value)}
                      className="mt-1 min-h-[36px] w-full rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-foreground">
                      Refund Amount (in ₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Max ${order.total_amount / 100}`}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="mt-1 min-h-[36px] w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Display existing refund info if already refunded and viewing another status */}
              {order.payment_status === "refunded" && selectedPaymentStatus !== "refunded" && order.refund_reference && (
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs">
                  <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    Recorded Refund
                  </span>
                  <p className="mt-1 text-muted-foreground">
                    Ref: <span className="font-mono text-foreground font-medium">{order.refund_reference}</span>
                  </p>
                  {order.refund_amount ? (
                    <p className="text-muted-foreground">
                      Amount: <span className="font-semibold text-foreground">{formatPrice(order.refund_amount)}</span>
                    </p>
                  ) : null}
                </div>
              )}

              {/* Uploaded Receipt Preview */}
              {order.receipt_url ? (
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <span className="font-semibold block mb-2 text-[11px] text-muted-foreground uppercase tracking-wider">
                    Customer Payment Screenshot
                  </span>
                  <div
                    onClick={() => setShowReceiptModal(true)}
                    className="relative h-40 w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-black/5 transition-opacity hover:opacity-90"
                  >
                    <Image
                      src={order.receipt_url}
                      alt="Customer payment proof"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Click to enlarge</span>
                    <a
                      href={order.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <span>Open original</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-3 text-center text-muted-foreground">
                  <p className="text-[11px]">No receipt screenshot uploaded yet</p>
                </div>
              )}

              <button
                type="button"
                disabled={isPending}
                onClick={handleVerifyPayment}
                className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <span>Update &amp; Confirm Payment</span>
              </button>
            </div>
          </section>

          {/* COURIER TRACKING MODULE */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2 border-b border-border/80 pb-3">
              <Truck className="size-4 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Courier &amp; Tracking Link
              </h2>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Courier Partner
                </label>
                <select
                  value={courierName}
                  onChange={(e) => handleCourierChange(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {COURIER_PARTNERS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tracking / AWB Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. BD721839210IN or DEL849204"
                  value={trackingNumber}
                  onChange={(e) => handleTrackingNumberChange(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tracking URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.bluedart.com/tracking..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Estimated Delivery Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Sept 2026 or 4-5 business days"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoAdvance"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="size-4 text-primary focus:ring-primary rounded"
                />
                <label htmlFor="autoAdvance" className="text-xs text-foreground font-medium cursor-pointer">
                  Auto-advance status to &ldquo;Dispatched&rdquo;
                </label>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveTracking}
                className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Truck className="size-4" />
                )}
                <span>Save Courier &amp; Tracking</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* FULL-SIZE RECEIPT MODAL */}
      {showReceiptModal && order.receipt_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl w-full overflow-hidden rounded-2xl bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif font-bold text-base text-foreground">Payment Screenshot</h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <div className="relative h-[70vh] w-full">
              <Image
                src={order.receipt_url}
                alt="Payment proof full size"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

