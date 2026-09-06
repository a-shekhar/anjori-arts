"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  Package,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/helpers";
import { siteConfig, inquiryHref } from "@/config/site";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/config/constants";
import type { Order } from "@/types";

interface OrderSuccessReceiptProps {
  order: Order;
}

export function OrderSuccessReceipt({ order }: OrderSuccessReceiptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    toast.success("Order number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const whatsappInquiryUrl = `${inquiryHref}?text=${encodeURIComponent(
    `Hello Anjori Arts, I would like an update on my order #${order.order_number}.`
  )}`;

  // Status index for the visual pipeline stepper
  const pipelineSteps = [
    { key: "received", label: "Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "framing_packing", label: "Framing & Packing" },
    { key: "dispatched", label: "Dispatched" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = pipelineSteps.findIndex(
    (step) => step.key === order.order_status
  );
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner (Hidden on Print) */}
      <div className="print:hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 sm:p-8 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </div>
        <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Acquisition Registered
        </span>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Thank you for collecting with Anjori Arts
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Your order has been recorded. A confirmation receipt has been sent to{" "}
          <strong className="text-foreground">{order.customer_email}</strong>.
        </p>

        {/* Order Reference Badge & Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs sm:text-sm shadow-xs">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-mono font-bold text-foreground">{order.order_number}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="ml-1 text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-1"
              title="Copy Order Reference"
              aria-label="Copy Order Reference"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          >
            <Printer className="size-4 text-primary" aria-hidden="true" />
            <span>Print Collector Invoice</span>
          </button>

          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[40px] items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-xs"
          >
            <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>WhatsApp Gallery Desk</span>
          </a>
        </div>
      </div>

      {/* Visual Fulfillment Pipeline Stepper (Hidden on Print) */}
      <div className="print:hidden rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fulfillment Status
        </h2>
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-2">
            {pipelineSteps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isPast
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast ? <Check className="size-4" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent
                        ? "text-foreground font-semibold"
                        : isPast
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Courier Tracking if available */}
          {order.tracking_number && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Truck className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-foreground">
                    Dispatched via {order.courier_name || "Courier"}:{" "}
                  </span>
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              </div>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <span>Track Package</span>
                  <ArrowRight className="size-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LUXURY COLLECTOR INVOICE & CERTIFICATE OF PROVENANCE */}
      <div
        id="collector-invoice"
        className="rounded-2xl border-2 border-border/80 bg-card p-6 shadow-sm sm:p-10 print:border print:border-gray-300 print:shadow-none print:p-8 print:bg-white"
      >
        {/* Top Atelier Header with Logo */}
        <div className="border-b-2 border-border/80 pb-6 flex flex-col sm:flex-row justify-between items-start gap-5">
          <div className="flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/30 shadow-xs bg-muted/20">
              <Image
                src="/logo.jpg"
                alt="Anjori Arts Crest"
                fill
                className="object-cover scale-125"
                sizes="64px"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground print:text-black">
                {siteConfig.name}
              </span>
              <p className="text-xs font-medium text-muted-foreground print:text-gray-700 tracking-wide mt-0.5">
                Handcrafted Indian Heritage &amp; Contemporary Fine Art
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-1">
                Puducherry Atelier, India • {siteConfig.email.orders} • {siteConfig.phone}
              </p>
            </div>
          </div>

          <div className="sm:text-right flex flex-col sm:items-end">
            <span className="inline-block rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary print:border-gray-400 print:bg-gray-100 print:text-black">
              Collector Acquisition Invoice
            </span>
            <p className="mt-2 font-mono text-base font-bold text-foreground print:text-black">
              #{order.order_number}
            </p>
            <p className="text-xs text-muted-foreground print:text-gray-600">
              Date: <strong className="text-foreground print:text-black">{formattedDate}</strong>
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 print:bg-gray-100 print:text-black print:border print:border-gray-300">
              ✓ {PAYMENT_STATUS_LABELS[order.payment_status] || "Acquisition Registered"}
            </span>
          </div>
        </div>

        {/* Collector & Consignment Details Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 py-6 border-b border-border/80 text-xs">
          {/* Left: Collector Shipping Destination */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 print:border print:border-gray-300 print:bg-transparent">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground print:text-gray-700">
              Collector &amp; Delivery Destination
            </span>
            <div className="mt-2 text-foreground print:text-black space-y-1">
              <p className="font-bold text-sm">{order.customer_name}</p>
              <p className="text-muted-foreground print:text-gray-800">{order.shipping_address.street}</p>
              {order.shipping_address.landmark && (
                <p className="text-muted-foreground print:text-gray-700">
                  Landmark: {order.shipping_address.landmark}
                </p>
              )}
              <p className="font-medium">
                {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                <span className="font-mono font-bold">{order.shipping_address.pincode}</span>
              </p>
              <p className="text-muted-foreground print:text-gray-700">
                {order.shipping_address.country || "India"}
              </p>
              <p className="text-muted-foreground print:text-gray-700 pt-1 border-t border-border/50 mt-1.5">
                Contact: {order.country_code} {order.customer_phone} • {order.customer_email}
              </p>
            </div>
          </div>

          {/* Right: Logistics & Payment Specifications */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 print:border print:border-gray-300 print:bg-transparent">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground print:text-gray-700">
              Acquisition &amp; Transit Record
            </span>
            <div className="mt-2 space-y-1.5 text-foreground print:text-black">
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-gray-700">Payment Option:</span>
                <span className="font-semibold">
                  {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                </span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground print:text-gray-700">Transaction Ref / UTR:</span>
                  <span className="font-mono font-bold">{order.payment_reference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-gray-700">Packaging Type:</span>
                <span className="font-medium">Museum 5-Layer Crating</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-gray-700">Transit Insurance:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 print:text-black">
                  100% Fully Insured Door-to-Door
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between border-t border-border/50 pt-1">
                  <span className="text-muted-foreground print:text-gray-700">Courier Tracking:</span>
                  <span className="font-mono font-bold">{order.courier_name}: {order.tracking_number}</span>
                </div>
              )}
              {order.delivery_instructions && (
                <p className="text-muted-foreground print:text-gray-800 italic pt-1 border-t border-border/50">
                  &ldquo;{order.delivery_instructions}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Artworks Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-border/80 text-muted-foreground print:text-black uppercase text-[11px] tracking-wider">
                <th className="pb-3 font-bold">Artwork Description</th>
                <th className="pb-3 font-bold text-center">Dimensions &amp; Finish</th>
                <th className="pb-3 font-bold text-center">Qty</th>
                <th className="pb-3 font-bold text-right">Unit Price</th>
                <th className="pb-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 print:divide-gray-300">
              {(order.items || []).map((item) => (
                <tr key={item.id} className="py-3.5">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20 print:size-10">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-foreground print:text-black text-sm">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-muted-foreground print:text-gray-700">
                          Authentic Handcrafted Indian Artwork • Archival Pigments
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-center text-muted-foreground print:text-gray-800">
                    <span className="font-medium text-foreground print:text-black">{item.size}</span>
                    <br />
                    <span className="text-[11px] text-primary print:text-black font-semibold">
                      {item.is_framed ? `Premium Framed (+${formatPrice(item.framing_price)})` : "Unframed"}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-foreground print:text-black font-bold">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right text-muted-foreground print:text-gray-800 font-medium">
                    {formatPrice(item.unit_price + item.framing_price)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-foreground print:text-black">
                    {formatPrice(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation & Certificate Summary */}
        <div className="border-t-2 border-border/80 pt-6 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
          {/* Left: Certificate of Authenticity & Provenance Seal */}
          <div className="max-w-md rounded-xl border border-primary/20 bg-primary/5 p-4 print:border print:border-gray-300 print:bg-gray-50/50">
            <div className="flex items-center gap-2 text-primary print:text-black font-serif font-bold text-sm">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Certificate of Authenticity &amp; Provenance</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground print:text-gray-800">
              Anjori Arts hereby certifies that the artwork(s) listed in this acquisition memo are authentic, handmade original creations crafted with archival-grade materials, traditional natural pigments, and museum preservation standards for lifelong cultural preservation.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground print:text-gray-700">
              <span>Atelier Location: <strong>Puducherry, India</strong></span>
              <span className="font-serif italic font-semibold">Authorized Atelier Curator Seal</span>
            </div>
          </div>

          {/* Right: Financial Totals Box */}
          <div className="w-full sm:w-72 rounded-xl border border-border/80 bg-muted/20 p-4 print:border print:border-gray-300 print:bg-transparent space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground print:text-gray-800">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground print:text-black">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground print:text-gray-800">
              <span>Insured Transit &amp; Packaging</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                COMPLIMENTARY
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground print:text-gray-700">
              <span>Estimated Taxes</span>
              <span>Included (12% GST)</span>
            </div>
            <div className="border-t-2 border-border/80 pt-2.5 flex justify-between font-bold text-base text-foreground print:text-black">
              <span>Total Value</span>
              <span className="font-serif text-lg text-primary print:text-black">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Gallery Footer Note on Print */}
        <div className="mt-8 border-t border-dashed border-border/80 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-muted-foreground print:text-gray-600 gap-2 text-center sm:text-left">
          <p>Thank you for supporting traditional Indian art preservation and living artisans.</p>
          <p className="font-mono">Anjori Arts • Puducherry Atelier • https://www.anjoriarts.com</p>
        </div>
      </div>

      {/* Return to Shop Action (Hidden on Print) */}
      <div className="print:hidden flex justify-center pt-4">
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>Continue Exploring Gallery</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

