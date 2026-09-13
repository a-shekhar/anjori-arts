"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Sparkles,
  Paintbrush,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatusBadge, CustomOrderStatusBadge } from "@/components/shared/StatusBadge";
import { AccountSubpageHeader } from "@/components/account/AccountSubpageHeader";
import type { Order, CustomOrder, PaymentStatus } from "@/types";

interface OrdersViewProps {
  orders: Order[];
  customOrders: CustomOrder[];
}

function getPaymentStatusBadge(status: PaymentStatus | string) {
  switch (status) {
    case "paid":
    case "verified":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          <span>Paid</span>
        </span>
      );
    case "receipt_uploaded":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
          <Clock className="size-3.5" />
          <span>Payment Under Review</span>
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" />
          <span>Payment Incomplete</span>
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Clock className="size-3.5" />
          <span>Pending</span>
        </span>
      );
  }
}

export function OrdersView({ orders, customOrders }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<string>("acquisitions");

  return (
    <div className="space-y-6">
      <AccountSubpageHeader
        title="Orders & Acquisitions"
        description="Track courier delivery for catalog paintings and review bespoke commission inquiries."
        action={
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto h-11 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="acquisitions"
                className="rounded-lg text-xs font-medium px-3 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs justify-center"
              >
                <ShoppingBag className="size-3.5 shrink-0" />
                <span>
                  <span className="sm:hidden">Orders ({orders.length})</span>
                  <span className="hidden sm:inline">Shop Orders ({orders.length})</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="commissions"
                className="rounded-lg text-xs font-medium px-3 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs justify-center"
              >
                <Paintbrush className="size-3.5 shrink-0" />
                <span>
                  <span className="sm:hidden">Custom ({customOrders.length})</span>
                  <span className="hidden sm:inline">Bespoke Commissions ({customOrders.length})</span>
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* 1. Shop Orders Tab Content */}
      {activeTab === "acquisitions" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 sm:p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                <ShoppingBag className="size-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground">
                No acquisitions recorded yet
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                You haven&apos;t placed any orders with this account yet. Explore our curated gallery of
                authentic handcrafted paintings.
              </p>
              <div className="mt-6">
                <Link href="/shop">
                  <Button className="rounded-xl font-medium gap-2 min-h-[44px] text-xs sm:text-sm">
                    <span>Explore Art Collection</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-primary/30"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {order.order_number}
                      </span>
                      <OrderStatusBadge status={order.order_status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <div className="font-serif text-base font-semibold text-foreground">
                        {formatPrice(order.total_amount)}
                      </div>
                      <div>{getPaymentStatusBadge(order.payment_status)}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="py-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                <Package className="size-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size} {item.is_framed ? "• Framed" : "• Unframed"} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-foreground shrink-0">
                          {formatPrice(item.line_total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Footer & Tracking */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {order.tracking_number ? (
                      <div className="flex items-center gap-1.5 text-primary">
                        <Truck className="size-4" />
                        <span>
                          Courier: {order.courier_name || "Express"} (Tracking: {order.tracking_number})
                        </span>
                      </div>
                    ) : (
                      <span>Standard courier delivery to {order.shipping_address?.city || "your address"}</span>
                    )}
                  </div>

                  <Link
                    href={`/order-success/${order.order_number}`}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 hover:underline transition-colors ml-auto relative after:absolute after:-inset-1"
                  >
                    <span>View receipt & tracking</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Bespoke Commissions Tab Content */}
      {activeTab === "commissions" && (
        <div className="space-y-4">
          {customOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 sm:p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Paintbrush className="size-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground">
                No custom commissions requested yet
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Have a specific vision, deity theme, or custom dimensions in mind? Collaborate
                directly with our master folk artists for bespoke Tanjore or Madhubani creations.
              </p>
              <div className="mt-6">
                <Link href="/custom-order">
                  <Button className="rounded-xl font-medium gap-2 min-h-[44px] text-xs sm:text-sm">
                    <Sparkles className="size-4" />
                    <span>Start Custom Commission</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            customOrders.map((custom) => (
              <div
                key={custom.id}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:border-primary/30 space-y-4"
              >
                {/* Header: Reference + Status */}
                <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {custom.order_reference}
                      </span>
                      <CustomOrderStatusBadge status={custom.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>
                        Requested on{" "}
                        {new Date(custom.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  {custom.quote_total && custom.quote_total > 0 ? (
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">Quotation Total</span>
                      <span className="font-serif text-base font-bold text-foreground">
                        ₹{custom.quote_total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Quotation in review
                    </span>
                  )}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 rounded-xl p-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Art Style</span>
                    <span className="font-medium text-foreground">
                      {custom.final_category || custom.category || "General Folk"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Medium</span>
                    <span className="font-medium text-foreground">
                      {custom.final_medium || custom.medium || "Artist Choice"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Surface</span>
                    <span className="font-medium text-foreground">
                      {custom.final_surface || custom.surface || "Canvas / Wood"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Preferred Size</span>
                    <span className="font-medium text-foreground">
                      {custom.final_size || custom.preferred_size || "Flexible"}
                    </span>
                  </div>
                </div>

                {/* Quotation Details (if quoted) */}
                {custom.quote_total && custom.quote_total > 0 && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-medium text-primary">
                      <span>Agreed Advance Deposit (50%)</span>
                      <span>₹{(custom.advance_deposit || Math.round(custom.quote_total / 2)).toLocaleString("en-IN")}</span>
                    </div>
                    {custom.estimated_timeline && (
                      <p className="text-[11px] text-muted-foreground">
                        Estimated Creation Timeline: <strong className="text-foreground">{custom.estimated_timeline}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Message / Description */}
                {custom.message && (
                  <div className="text-xs text-muted-foreground bg-card rounded-lg border border-border p-3">
                    <p className="font-medium text-foreground mb-1 text-[11px]">Your Request Notes:</p>
                    <p className="line-clamp-3 leading-relaxed">{custom.message}</p>
                  </div>
                )}

                {/* Reference Images Preview */}
                {custom.reference_images && custom.reference_images.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground mb-2 block">
                      Reference Inspiration Photos ({custom.reference_images.length}):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {custom.reference_images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border bg-muted hover:opacity-90"
                        >
                          <Image src={img} alt={`Reference ${idx + 1}`} fill className="object-cover" sizes="56px" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground text-[11px] leading-relaxed">
                    Questions regarding this piece? Contact us via support with ref: <strong className="font-mono text-foreground">{custom.order_reference}</strong>
                  </span>
                  <Link
                    href="/custom-order"
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 hover:underline transition-colors shrink-0 self-start sm:self-auto relative after:absolute after:-inset-1"
                  >
                    <span>Request new piece</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
