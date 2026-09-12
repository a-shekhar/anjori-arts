"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShoppingBag,
  TrendingUp,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Paintbrush,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/config/constants";
import { getAdminCustomerDetail } from "@/actions/admin-customers";
import type {
  AdminCustomerSummary,
  AdminCustomerDetail,
  AdminCustomersStats,
  OrderStatus,
  PaymentStatus,
} from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AdminCustomersTableProps {
  initialCustomers: AdminCustomerSummary[];
  stats: AdminCustomersStats;
}

const TABS = [
  { key: "all", label: "All Customers" },
  { key: "registered", label: "Registered Collectors" },
  { key: "guest", label: "Guest Buyers" },
  { key: "repeat", label: "Repeat Collectors (VIP)" },
] as const;

export function AdminCustomersTable({
  initialCustomers,
  stats,
}: AdminCustomersTableProps) {
  const [customers] = useState<AdminCustomerSummary[]>(initialCustomers);
  const [activeTab, setActiveTab] = useState<"all" | "registered" | "guest" | "repeat">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<AdminCustomerDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter customers by tab & search query
  const filteredCustomers = customers.filter((c) => {
    if (activeTab === "registered" && c.type !== "registered") return false;
    if (activeTab === "guest" && c.type !== "guest") return false;
    if (activeTab === "repeat" && c.totalOrders <= 1) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(term);
      const matchEmail = c.email.toLowerCase().includes(term);
      const matchPhone = (c.phone || "").toLowerCase().includes(term);
      return matchName || matchEmail || matchPhone;
    }

    return true;
  });

  const handleOpenDrawer = (customer: AdminCustomerSummary) => {
    setSelectedCustomerId(customer.id);
    setCustomerDetail(null);
    setIsDrawerOpen(true);

    startTransition(async () => {
      const detail = await getAdminCustomerDetail(customer.id);
      setCustomerDetail(detail);
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (name[0] || "C").toUpperCase();
  };

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
      {/* 1. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Customers</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.totalCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Registered Collectors</span>
            <UserCheck className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.registeredCollectors}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Guest Buyers</span>
            <ShoppingBag className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.guestBuyers}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Repeat Collectors (VIP)</span>
            <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {stats.totalRepeatCollectors}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-border bg-card p-4 sm:col-span-1 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Spend (LTV)</span>
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {formatPrice(stats.totalCustomerRevenue)}
          </p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TABS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? stats.totalCustomers
                : tab.key === "registered"
                ? stats.registeredCollectors
                : tab.key === "guest"
                ? stats.guestBuyers
                : stats.totalRepeatCollectors;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* 3. CUSTOMERS DATA TABLE */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-muted-foreground text-[11px]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Collector</th>
                <th className="px-4 py-3.5 font-semibold">Contact</th>
                <th className="px-4 py-3.5 font-semibold">Type &amp; Auth</th>
                <th className="px-4 py-3.5 font-semibold">Orders &amp; LTV</th>
                <th className="px-4 py-3.5 font-semibold">Activity</th>
                <th className="px-4 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto size-8 opacity-40" />
                    <p className="mt-2 font-medium">No customers found</p>
                    <p className="text-[11px]">
                      No customers match the current filter or search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const joinedDate = new Date(customer.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  const lastOrderDateStr = customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "No orders yet";

                  return (
                    <tr key={customer.id} className="transition-colors hover:bg-muted/30">
                      {/* Collector Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary text-xs">
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground">
                                {customer.name}
                              </span>
                              {customer.role === "ADMIN" && (
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                                  <ShieldAlert className="size-2.5" /> Admin
                                </span>
                              )}
                              {customer.hasActiveCommission && (
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                                  <Paintbrush className="size-2.5" /> Commission
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {customer.type === "registered" ? "Collector ID: " : "Guest Email"}
                              <span className="font-mono text-[10px]">
                                {customer.id.startsWith("guest:")
                                  ? customer.email
                                  : customer.id.slice(0, 8)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${customer.email}`}
                            className="inline-flex items-center gap-1.5 text-foreground hover:text-primary hover:underline"
                          >
                            <Mail className="size-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </a>
                          {customer.phone && (
                            <div>
                              <a
                                href={`tel:${customer.phone}`}
                                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                              >
                                <Phone className="size-3 text-muted-foreground" />
                                <span>{customer.phone}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type & Provider */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              customer.type === "registered"
                                ? "bg-blue-500/15 text-blue-800 dark:text-blue-300"
                                : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {customer.type === "registered" ? (
                              <>
                                <UserCheck className="size-3" /> Registered
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="size-3" /> Guest
                              </>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            Via {customer.authProvider || "email"}
                          </span>
                        </div>
                      </td>

                      {/* Orders & Total Spend (LTV) */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">
                              {formatPrice(customer.totalSpent)}
                            </span>
                            {customer.totalOrders > 1 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-purple-700 dark:text-purple-300">
                                <Sparkles className="size-2.5" /> VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                          </p>
                        </div>
                      </td>

                      {/* Activity Dates */}
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="size-3 opacity-70" />
                            <span>Joined: {joinedDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="size-3 opacity-70" />
                            <span>Last order: {lastOrderDateStr}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(customer)}
                          aria-label={`Inspect collector profile for ${customer.name}`}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CUSTOMER PROFILE SLIDE-OVER DRAWER */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6 flex flex-col gap-6"
        >
          <SheetHeader className="p-0 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-lg font-bold text-primary">
                {customerDetail ? getInitials(customerDetail.name) : "C"}
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="font-serif text-xl font-bold text-foreground truncate">
                  {customerDetail ? customerDetail.name : "Loading Collector..."}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground truncate">
                  {customerDetail ? customerDetail.email : "Fetching collector record..."}
                </SheetDescription>
              </div>
            </div>

            {/* Quick Contact Bar */}
            {customerDetail && (
              <div className="mt-3 flex flex-wrap gap-2 pt-2">
                <a
                  href={`mailto:${customerDetail.email}`}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Mail className="size-3 text-primary" />
                  <span>Send Email</span>
                </a>
                {customerDetail.phone && (
                  <a
                    href={`tel:${customerDetail.phone}`}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Call ({customerDetail.phone})</span>
                  </a>
                )}
                {customerDetail.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                    <ShieldCheck className="size-3.5" /> Platform Admin
                  </span>
                )}
              </div>
            )}
          </SheetHeader>

          {/* Drawer Body Content */}
          {isPending || !customerDetail ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-xs font-medium">Loading collector history &amp; orders...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Financial & Account Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-[11px] text-muted-foreground">Lifetime Spend</span>
                  <p className="mt-1 font-serif text-lg font-bold text-foreground">
                    {formatPrice(customerDetail.totalSpent)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-[11px] text-muted-foreground">Total Orders</span>
                  <p className="mt-1 font-serif text-lg font-bold text-foreground">
                    {customerDetail.totalOrders}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-[11px] text-muted-foreground">Account Type</span>
                  <p className="mt-1 text-xs font-semibold capitalize text-foreground">
                    {customerDetail.type} ({customerDetail.authProvider})
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <span className="text-[11px] text-muted-foreground">Member Since</span>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    {new Date(customerDetail.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Order History */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <span>Purchase History ({customerDetail.orders.length})</span>
                  </h3>
                </div>

                {customerDetail.orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No orders placed by this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customerDetail.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <Link
                              href={`/admin/orders/${ord.id}`}
                              className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>{ord.order_number}</span>
                              <ExternalLink className="size-3" />
                            </Link>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(ord.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-foreground text-xs">
                              {formatPrice(ord.total_amount)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-[10px]">
                          <span
                            className={`rounded-full border px-2 py-0.5 font-semibold ${getStatusBadgeClass(
                              ord.order_status
                            )}`}
                          >
                            {ORDER_STATUS_LABELS[ord.order_status] || ord.order_status}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 font-medium ${getPaymentBadgeClass(
                              ord.payment_status
                            )}`}
                          >
                            {PAYMENT_STATUS_LABELS[ord.payment_status] || ord.payment_status}
                          </span>
                          {ord.shipping_address?.city && (
                            <span className="text-muted-foreground">
                              To: {ord.shipping_address.city}, {ord.shipping_address.state}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Custom Commissions / Orders */}
              {customerDetail.customOrders.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
                    <Paintbrush className="size-4 text-purple-600 dark:text-purple-400" />
                    <span>Custom Commissions ({customerDetail.customOrders.length})</span>
                  </h3>

                  <div className="space-y-2.5">
                    {customerDetail.customOrders.map((co) => (
                      <div
                        key={co.id}
                        className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Link
                              href="/admin/custom-orders"
                              className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>{co.order_reference}</span>
                              <ExternalLink className="size-3" />
                            </Link>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {co.category || "Custom Artwork"} &bull; {co.medium || "Mixed"}
                            </span>
                          </div>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-foreground">
                            {co.status}
                          </span>
                        </div>
                        {co.quote_total ? (
                          <div className="text-[11px] text-muted-foreground">
                            Quote: ₹{co.quote_total.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Saved Delivery Addresses */}
              <section className="space-y-3">
                <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Delivery Addresses ({customerDetail.addresses.length})</span>
                </h3>

                {customerDetail.addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No saved delivery addresses on file.
                  </div>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {customerDetail.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-xl border border-border bg-card p-3 shadow-xs text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {addr.recipient_name}
                          </span>
                          {addr.is_default && (
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.2 text-[9px] font-semibold text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {addr.street}
                          {addr.landmark ? `, ${addr.landmark}` : ""}
                          <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

