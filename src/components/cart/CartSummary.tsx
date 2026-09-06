"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Truck, Sparkles, ArrowRight, FileText, Lock } from "lucide-react";
import { type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/helpers";
import { STANDARD_DELIVERY_CHARGE } from "@/config/constants";
import { inquiryHref } from "@/config/site";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export function CartSummary({
  items,
  subtotal,
  deliveryCharge,
  total,
}: CartSummaryProps) {
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Standard shipping & packaging value based on artwork count (e.g. ₹150 per piece)
  const standardShippingTotal = totalItemsCount * STANDARD_DELIVERY_CHARGE;
  const deliverySavings = Math.max(0, standardShippingTotal - deliveryCharge);

  // Calculate direct discount on artwork MRP
  const artworkSavings = items.reduce(
    (sum, item) => sum + Math.max(0, (item.mrp - item.sellingPrice) * item.quantity),
    0
  );
  const totalSavings = artworkSavings + deliverySavings;

  // Construct itemized WhatsApp order message
  const generateWhatsAppHref = () => {
    const lines: string[] = [
      "Hello Anjori Arts,",
      "",
      "I would like to place an order for the following items:",
      "",
    ];

    items.forEach((item, index) => {
      const unitPrice = item.sellingPrice + (item.framingPrice || 0);
      const lineTotal = unitPrice * item.quantity;
      lines.push(
        `${index + 1}. *${item.title}*`,
        `   • Size: ${item.size}`,
        `   • Finish: ${item.isFramed ? `Premium Framed (+${formatPrice(item.framingPrice || 0)})` : "Unframed"}`,
        `   • Quantity: ${item.quantity}`,
        `   • Amount: ${formatPrice(lineTotal)}`,
        ""
      );
    });

    lines.push(
      "--------------------------",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Shipping (${totalItemsCount} ${totalItemsCount === 1 ? "piece" : "pieces"}): FREE (${formatPrice(deliverySavings)} absorbed by Anjori Arts)`,
      `*Total Order Value: ${formatPrice(total)}*`
    );

    if (totalSavings > 0) {
      lines.push(`Total Savings on this order: ${formatPrice(totalSavings)}`);
    }

    lines.push("--------------------------");

    if (note.trim()) {
      lines.push("", `Special Request / Note: "${note.trim()}"`);
    }

    lines.push(
      "",
      "Could you please confirm artwork availability and share payment options?"
    );

    return `${inquiryHref}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:p-7">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        Order Summary
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {totalItemsCount} {totalItemsCount === 1 ? "piece" : "pieces"} in your bag
      </p>

      {/* Financial Breakdown */}
      <dl className="mt-6 space-y-3.5 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="font-medium text-foreground">{formatPrice(subtotal)}</dd>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <dt className="flex items-center gap-1.5">
            <span>Shipping &amp; Delivery</span>
            <span className="text-xs text-muted-foreground">
              ({totalItemsCount} {totalItemsCount === 1 ? "piece" : "pieces"})
            </span>
          </dt>
          <dd className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/60 line-through">
              {formatPrice(standardShippingTotal)}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              FREE
            </span>
          </dd>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <dt>Estimated Taxes</dt>
          <dd>Included in Price (12% GST)</dd>
        </div>

        <div className="border-t border-border pt-3.5">
          <div className="flex items-baseline justify-between">
            <dt className="text-base font-semibold text-foreground">Total</dt>
            <dd className="font-serif text-2xl font-bold text-foreground">
              {formatPrice(total)}
            </dd>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Complimentary door-to-door insured shipping across India.
          </p>
        </div>
      </dl>

      {/* Total Savings Highlight */}
      {totalSavings > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-200">
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Total Savings on this order: {formatPrice(totalSavings)}</span>
          </div>
          <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
            {artworkSavings > 0 && (
              <div>• {formatPrice(artworkSavings)} direct artwork discount</div>
            )}
            {deliverySavings > 0 && (
              <div>
                • {formatPrice(deliverySavings)} museum packaging &amp; insured shipping absorbed by Anjori Arts ({formatPrice(STANDARD_DELIVERY_CHARGE)} × {totalItemsCount} {totalItemsCount === 1 ? "piece" : "pieces"})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional Note / Special Request */}
      <div className="mt-5 border-t border-border/80 pt-4">
        {!showNoteInput ? (
          <button
            type="button"
            onClick={() => setShowNoteInput(true)}
            className="flex items-center gap-2 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            Add gift note or delivery instructions
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="order-note" className="text-xs font-medium text-foreground">
                Note / Special Instructions
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNoteInput(false);
                  setNote("");
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={250}
              rows={2}
              placeholder="e.g. Please add a birthday greeting note, or deliver on weekday afternoon..."
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="text-right text-[10px] text-muted-foreground">
              {note.length}/250
            </div>
          </div>
        )}
      </div>

      {/* Primary Checkout CTA */}
      <div className="mt-6 space-y-3">
        <Link
          href="/checkout"
          className={cn(
            "flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3.5 text-center font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]"
          )}
        >
          <Lock className="size-4" aria-hidden="true" />
          <span>Proceed to Checkout</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>

        <a
          href={generateWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <MessageCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>Prefer to discuss on WhatsApp?</span>
        </a>

        <Link
          href="/shop"
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Trust Assurances */}
      <div className="mt-7 space-y-3 border-t border-border/80 pt-6 text-xs text-muted-foreground">
        <div className="flex items-start gap-3">
          <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <span className="font-medium text-foreground">Free Insured Transit: </span>
            Every package is crated with multi-layer drop-proof foam and transit insurance.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <span className="font-medium text-foreground">Authentic Art: </span>
            Directly from skilled Indian traditional and contemporary artists.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <span className="font-medium text-foreground">Personalized Support: </span>
            Direct communication with the team for custom framing and delivery tracking.
          </div>
        </div>
      </div>
    </div>
  );
}

