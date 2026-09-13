"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  ShoppingBag,
  Clock,
  Package,
  Truck,
  TrendingUp,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/config/constants";
import type { Order, OrderStatus, PaymentStatus } from "@/types";
import type { AdminOrderStats } from "@/actions/admin-orders";

interface AdminOrdersTableProps {
  initialOrders: Order[];
  stats: AdminOrderStats;
}

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All Orders" },
  { key: "received", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "framing_packing", label: "Framing & Packing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export function AdminOrdersTable({ initialOrders, stats }: AdminOrdersTableProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab !== "all" && order.order_status !== activeTab) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchNumber = order.order_number.toLowerCase().includes(term);
      const matchName = order.customer_name.toLowerCase().includes(term);
      const matchEmail = order.customer_email.toLowerCase().includes(term);
      const matchPhone = order.customer_phone.toLowerCase().includes(term);
      const matchTracking = (order.tracking_number || "").toLowerCase().includes(term);
      return matchNumber || matchName || matchEmail || matchPhone || matchTracking;
    }

    return true;
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "confirmed":
        return "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30";
      case "framing_packing":
        return "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30";
      case "dispatched":
        return "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30";
      case "delivered":
        return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPaymentBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
      case "verified":
        return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
      case "receipt_uploaded":
        return "bg-blue-500/15 text-blue-800 dark:text-blue-300 animate-pulse";
      case "pending":
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300";
      case "failed":
        return "bg-red-500/15 text-red-800 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingBag className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Payment Verifying</span>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.pendingVerification}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Framing / Packing</span>
            <Package className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.inFramingPacking}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Dispatched</span>
            <Truck className="size-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.dispatched}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-border bg-card p-4 sm:col-span-1 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Verified Revenue</span>
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>
      </div>

      {/* SEARCH AND STATUS TABS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex min-h-[36px] sm:min-h-[32px] items-center rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer relative after:absolute after:-inset-1 ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Order #, collector, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[44px] h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* ORDERS CONTENT: TABLE ON DESKTOP, CARDS ON MOBILE */}
      {filteredOrders.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground shadow-xs">
          <ShoppingBag className="mx-auto size-10 opacity-40" />
          <p className="mt-3 font-semibold text-foreground text-sm">No orders found</p>
          <p className="text-xs mt-1">No orders match the current filter or search criteria.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (>= 768px) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-muted-foreground text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Order Reference</th>
                    <th className="px-4 py-3.5 font-semibold">Collector</th>
                    <th className="px-4 py-3.5 font-semibold">Destination</th>
                    <th className="px-4 py-3.5 font-semibold">Amount</th>
                    <th className="px-4 py-3.5 font-semibold">Payment</th>
                    <th className="px-4 py-3.5 font-semibold">Fulfillment</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((order) => {
                    const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={order.id} className="transition-colors hover:bg-muted/30">
                        {/* Order Number & Date */}
                        <td className="px-4 py-3.5 font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs font-bold text-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-[11px] text-muted-foreground">{dateStr}</p>
                        </td>

                        {/* Collector Details */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-foreground">{order.customer_name}</span>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{order.customer_phone}</span>
                          </div>
                        </td>

                        {/* Destination City/State */}
                        <td className="px-4 py-3.5 text-muted-foreground">
                          <span className="text-foreground font-medium">
                            {order.shipping_address.city}
                          </span>
                          <p className="text-[11px]">
                            {order.shipping_address.state} ({order.shipping_address.pincode})
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                          {order.delivery_charge === 0 && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Free Shipping
                            </p>
                          )}
                        </td>

                        {/* Payment Method & Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${getPaymentBadgeClass(
                              order.payment_status
                            )}`}
                          >
                            {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                          </span>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                          </p>
                        </td>

                        {/* Fulfillment Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                              order.order_status
                            )}`}
                          >
                            {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                          </span>
                          {order.tracking_number && (
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {order.courier_name}: {order.tracking_number}
                            </p>
                          )}
                        </td>

                        {/* Manage Order Action */}
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary relative after:absolute after:-inset-1"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>Manage</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (< 768px) */}
          <div className="grid gap-3.5 md:hidden">
            {filteredOrders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const cleanPhone = order.customer_phone.replace(/\D/g, "");
              const countryCode = order.country_code?.replace("+", "") || "91";
              const whatsappUrl = `https://wa.me/${countryCode}${cleanPhone}?text=${encodeURIComponent(
                `Hello ${order.customer_name}, regarding your order #${order.order_number} from Anjori Arts`
              )}`;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3.5"
                >
                  {/* Card Top: Order Number, Date & Fulfillment Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-border/70 pb-3">
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm font-bold text-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{dateStr}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${getStatusBadgeClass(
                        order.order_status
                      )}`}
                    >
                      {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                    </span>
                  </div>

                  {/* Collector Info & Fast Contact Buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cleanPhone && (
                        <>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp ${order.customer_name}`}
                            className="inline-flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          >
                            <MessageCircle className="size-4" />
                          </a>
                          <a
                            href={`tel:${order.country_code || "+91"}${cleanPhone}`}
                            aria-label={`Call ${order.customer_name}`}
                            className="inline-flex size-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition-colors hover:bg-muted"
                          >
                            <Phone className="size-4 text-primary" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount & Payment Status Row */}
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3.5 py-2.5 text-xs">
                    <div>
                      <span className="font-serif text-base font-bold text-foreground">
                        {formatPrice(order.total_amount)}
                      </span>
                      {order.delivery_charge === 0 && (
                        <span className="ml-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Free Ship
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getPaymentBadgeClass(
                          order.payment_status
                        )}`}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Snippet if Available */}
                  {order.tracking_number && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[11px] text-cyan-900 dark:text-cyan-200">
                      <span className="font-medium">Tracking ({order.courier_name}): </span>
                      <span className="font-mono">{order.tracking_number}</span>
                    </div>
                  )}

                  {/* Full-Width Manage Action Button */}
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                  >
                    <Eye className="size-4" />
                    <span>Manage Order &amp; Fulfillment</span>
                    <ChevronRight className="size-4 ml-auto" />
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

