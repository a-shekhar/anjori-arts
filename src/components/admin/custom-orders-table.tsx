"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  ChevronRight,
  MoreVertical,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  updateCustomOrderStatus,
  deleteCustomOrder,
} from "@/actions/admin-custom-orders";
import {
  formatStatusLabel,
  getStatusBadgeVariant,
  ALL_CUSTOM_ORDER_STATUSES,
} from "@/lib/custom-orders";
import { toast } from "sonner";
import type { CustomOrder } from "@/types";

interface CustomOrdersTableProps {
  orders: CustomOrder[];
}

export function CustomOrdersTable({ orders }: CustomOrdersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Quick View Modal
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Status Updating State
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(orders.map((o) => o.category).filter(Boolean))
  ).sort();

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.order_reference.toLowerCase().includes(q) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(q) ||
      order.email.toLowerCase().includes(q) ||
      (order.phone && order.phone.toLowerCase().includes(q)) ||
      (order.category || "").toLowerCase().includes(q) ||
      (order.message || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === "new_submitted" &&
        (order.status.toLowerCase() === "new" ||
          order.status.toLowerCase() === "submitted"));

    const matchesCategory =
      categoryFilter === "all" ||
      (order.category || "").toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle status update
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const toastId = toast.loading(`Updating status to ${formatStatusLabel(newStatus)}...`);

    try {
      const res = await updateCustomOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success("Order status updated", { id: toastId });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(`Error: ${res.message || "Failed to update status"}`, {
          id: toastId,
        });
      }
    } catch {
      toast.error("Failed to update status", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete order
  const handleDelete = async (order: CustomOrder) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete custom order ${order.order_reference} from ${order.first_name} ${order.last_name}? This cannot be undone.`
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting custom order...");
    try {
      const res = await deleteCustomOrder(order.id);
      if (res.success) {
        toast.success("Custom order deleted", { id: toastId });
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(null);
        }
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(`Error: ${res.message || "Failed to delete"}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to delete custom order", { id: toastId });
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Generate WhatsApp link
  const getWhatsAppLink = (order: CustomOrder) => {
    if (!order.phone) return null;
    const cleanPhone = (order.country_code + order.phone).replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hi ${order.first_name}, thank you for reaching out to Anjori Arts regarding your custom order commission (${order.order_reference}).`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const isFiltered = search !== "" || statusFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, customer, email, category..."
            className="pl-9 pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:inline-block" />
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val || "all")}
            >
              <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new_submitted">New / Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <Select
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val || "all")}
            >
              <SelectTrigger className="w-full sm:w-[150px] text-xs sm:text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Orders Count Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Showing <strong>{filteredOrders.length}</strong> of{" "}
          <strong>{orders.length}</strong> custom orders
        </span>
      </div>

      {/* Desktop & Tablet Table View (hidden on small mobile) */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Specs & Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Refs</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-foreground">No custom orders found</p>
                    <p className="text-xs text-muted-foreground">
                      {isFiltered
                        ? "Try clearing or modifying your search filters."
                        : "Custom commissions submitted by clients will show up here."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const waLink = getWhatsAppLink(order);
                const hasImages = order.reference_images && order.reference_images.length > 0;

                return (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    {/* Order Reference */}
                    <TableCell className="font-mono font-medium text-xs">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-semibold text-primary hover:underline text-left"
                      >
                        {order.order_reference}
                      </button>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm text-foreground">
                          {order.first_name} {order.last_name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <a
                            href={`mailto:${order.email}?subject=Regarding your custom order ${order.order_reference} - Anjori Arts`}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                            title={order.email}
                          >
                            <Mail className="h-3 w-3" />
                            <span className="max-w-[130px] truncate">{order.email}</span>
                          </a>
                          {order.phone && (
                            <>
                              <span>•</span>
                              {waLink ? (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                  title="Chat on WhatsApp"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{order.phone}</span>
                                </a>
                              ) : (
                                <span>{order.phone}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Artwork Specs */}
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[220px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[11px] font-normal py-0">
                            {order.category}
                            {order.category || "Not specified"}
                          </Badge>
                          {order.surface && (
                            <span className="text-[11px] text-muted-foreground">
                              {order.surface}
                            </span>
                          )}
                        </div>
                        {(order.preferred_size || order.medium) && (
                          <span className="text-xs text-muted-foreground truncate">
                            {[order.preferred_size, order.medium].filter(Boolean).join(" • ")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Budget */}
                    {/* Budget / Quotation */}
                    <TableCell className="text-xs text-foreground font-medium whitespace-nowrap">
                      {order.budget ? order.budget : <span className="text-muted-foreground font-normal">—</span>}
                      {(order.quote_total || 0) > 0 ? (
                        <div>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block font-mono">
                            ₹{order.quote_total?.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            Quote ({order.items?.length || 0} pcs)
                          </span>
                        </div>
                      ) : order.budget ? (
                        order.budget
                      ) : (
                        <span className="text-muted-foreground font-normal">—</span>
                      )}
                    </TableCell>

                    {/* Reference Images */}
                    <TableCell>
                      {hasImages ? (
                        <div
                          className="relative h-10 w-10 rounded-md overflow-hidden bg-muted border cursor-pointer group-hover:border-primary transition-colors shrink-0"
                          onClick={() => setSelectedOrder(order)}
                          title={`${order.reference_images.length} reference image(s)`}
                        >
                          <Image
                            src={order.reference_images[0]}
                            alt={`Ref for ${order.order_reference}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                          {order.reference_images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-bold px-1 rounded-tl">
                              +{order.reference_images.length - 1}
                            </span>
                          )}
                        </div>
                      ) : order.reference_link ? (
                        <a
                          href={order.reference_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          title={order.reference_link}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Link
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </TableCell>

                    {/* Status Dropdown */}
                    <TableCell>
                      <Select
                        value={order.status.toLowerCase()}
                        onValueChange={(val) => val && handleStatusChange(order.id, val)}
                        disabled={updatingId === order.id || isPending}
                      >
                        <SelectTrigger
                          className={`h-7 text-xs border rounded-full font-medium px-2.5 ${getStatusBadgeVariant(
                            order.status
                          )}`}
                        >
                          <SelectValue>{formatStatusLabel(order.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_CUSTOM_ORDER_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 text-muted-foreground hover:text-foreground relative after:absolute after:-inset-1.5"
                          onClick={() => setSelectedOrder(order)}
                          title="Quick View"
                          aria-label="Quick View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link
                          href={`/admin/custom-orders/${order.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                            className: "size-8 text-muted-foreground hover:text-primary relative after:absolute after:-inset-1.5",
                          })}
                          title="Open Full Page"
                          aria-label="Open Full Order Page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button
                              className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground relative after:absolute after:-inset-1.5 cursor-pointer"
                              aria-label="More options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" /> Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem render={
                              <Link href={`/admin/custom-orders/${order.id}`}>
                                <ChevronRight className="mr-2 h-4 w-4" /> Full Details Page
                              </Link>
                            } />
                            {waLink && (
                              <DropdownMenuItem render={
                                <a href={waLink} target="_blank" rel="noopener noreferrer">
                                  <Phone className="mr-2 h-4 w-4 text-emerald-600" /> WhatsApp Customer
                                  <Phone className="mr-2 h-4 w-4 text-whatsapp" /> WhatsApp Customer
                                </a>
                              } />
                            )}
                            <DropdownMenuItem render={
                              <a
                                href={`mailto:${order.email}?subject=Regarding your custom order ${order.order_reference} - Anjori Arts`}
                              >
                                <Mail className="mr-2 h-4 w-4" /> Email Customer
                              </a>
                            } />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(order)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium text-foreground">No custom orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isFiltered ? "Try clearing your filters." : "Incoming custom orders will appear here."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const waLink = getWhatsAppLink(order);
            const hasImages = order.reference_images && order.reference_images.length > 0;

            return (
              <div
                key={order.id}
                className="rounded-xl border bg-card p-4 space-y-3 shadow-xs"
              >
                {/* Header: Ref & Status */}
                <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {order.order_reference}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <Select
                    value={order.status.toLowerCase()}
                    onValueChange={(val) => val && handleStatusChange(order.id, val)}
                    disabled={updatingId === order.id || isPending}
                  >
                    <SelectTrigger
                      className={`h-6 text-[11px] border rounded-full font-medium px-2 ${getStatusBadgeVariant(
                        order.status
                      )}`}
                    >
                      <SelectValue>{formatStatusLabel(order.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CUSTOM_ORDER_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="font-medium text-sm text-foreground">
                    {order.first_name} {order.last_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${order.email}?subject=Custom Order ${order.order_reference} - Anjori Arts`}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[160px]">{order.email}</span>
                    </a>
                    {order.phone && (
                      <span className="flex items-center gap-1">
                        • <Phone className="h-3 w-3" /> {order.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs Pill */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <Badge variant="secondary" className="font-normal text-[11px]">
                    {order.category}
                    {order.category || "Not specified"}
                  </Badge>
                  {order.surface && (
                    <Badge variant="outline" className="font-normal text-[11px]">
                      {order.surface}
                    </Badge>
                  )}
                  {(order.quote_total || 0) > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold ml-auto font-mono">
                      Quote: ₹{order.quote_total?.toLocaleString("en-IN")}
                    </span>
                  ) : order.budget ? (
                    <span className="text-muted-foreground text-[11px] font-medium ml-auto">
                      Budget: {order.budget}
                    </span>
                  ) : null}
                </div>

                {/* Reference Images Preview */}
                {hasImages && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.reference_images.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-10 w-10 rounded-md border-2 border-background overflow-hidden bg-muted cursor-pointer shrink-0"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Image
                            src={img}
                            alt="Reference thumbnail"
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                    {order.reference_images.length > 3 && (
                      <span className="text-xs text-muted-foreground font-medium">
                        +{order.reference_images.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons (Accessible min 44x44px touch targets) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] text-xs flex items-center justify-center gap-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className:
                          "min-h-[44px] text-xs flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400",
                      })}
                    >
                      <Phone className="h-4 w-4" /> WhatsApp
                    </a>
                  ) : (
                    <a
                      href={`mailto:${order.email}?subject=Custom Order ${order.order_reference} - Anjori Arts`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "min-h-[44px] text-xs flex items-center justify-center gap-1",
                      })}
                    >
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                  <Link
                    href={`/admin/custom-orders/${order.id}`}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "min-h-[44px] text-xs flex items-center justify-center gap-1",
                    })}
                  >
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick View Detail Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
          {selectedOrder && (
            <>
              <DialogHeader className="pr-8 shrink-0 pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary block">
                      {selectedOrder.order_reference}
                    </span>
                    <DialogTitle className="text-xl font-bold mt-0.5">
                      Custom Order Inquiry
                    </DialogTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs px-3 py-1 font-medium self-start sm:self-auto ${getStatusBadgeVariant(
                      selectedOrder.status
                    )}`}
                  >
                    {formatStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Submitted on {formatDate(selectedOrder.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-5 py-4 pr-1">
                {/* Customer Contact Card */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Name</span>
                      <span className="font-medium text-foreground truncate block">
                        {selectedOrder.first_name} {selectedOrder.last_name}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Email</span>
                      <a
                        href={`mailto:${selectedOrder.email}?subject=Regarding your custom order ${selectedOrder.order_reference} - Anjori Arts`}
                        className="text-primary hover:underline font-medium break-all block"
                      >
                        {selectedOrder.email}
                      </a>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Phone</span>
                      <span className="font-medium text-foreground block">
                        {selectedOrder.phone ? `${selectedOrder.country_code} ${selectedOrder.phone}` : "Not provided"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Direct Contact</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {getWhatsAppLink(selectedOrder) && (
                          <a
                            href={getWhatsAppLink(selectedOrder)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className:
                                "h-8 text-xs text-whatsapp border-whatsapp/30",
                            })}
                          >
                            <Phone className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}
                        <a
                          href={`mailto:${selectedOrder.email}?subject=Regarding your custom order ${selectedOrder.order_reference} - Anjori Arts`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-8 text-xs",
                          })}
                        >
                          <Mail className="mr-1.5 h-3.5 w-3.5" /> Send Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Quotation Banner if present */}
                {(selectedOrder.quote_total || 0) > 0 && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block font-mono">
                        Active Quotation: ₹{selectedOrder.quote_total?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {selectedOrder.items?.length || 0} artwork piece(s) • Advance Deposit (50%): ₹{(selectedOrder.advance_deposit || 0).toLocaleString("en-IN")}
                        {selectedOrder.estimated_timeline ? ` • Timeline: ${selectedOrder.estimated_timeline}` : ""}
                      </span>
                    </div>
                    <Link
                      href={`/admin/custom-orders/${selectedOrder.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "h-7 text-xs bg-background shrink-0",
                      })}
                    >
                      Edit Quote & Details
                    </Link>
                  </div>
                )}

                {/* Artwork Specifications Card */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Requested Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Category</span>
                      <span className="font-medium text-foreground break-words block mt-0.5">
                        {selectedOrder.category}
                        {selectedOrder.category || "Not specified"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Medium</span>
                      <span className="font-medium text-foreground break-words block mt-0.5">
                        {selectedOrder.medium || "Not specified"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Surface</span>
                      <span className="font-medium text-foreground break-words block mt-0.5">
                        {selectedOrder.surface || "Not specified"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Preferred Size</span>
                      <span className="font-medium text-foreground break-words block mt-0.5">
                        {selectedOrder.preferred_size || "Not specified"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground block">Budget</span>
                      <span className="font-medium text-foreground break-words block mt-0.5">
                        {selectedOrder.budget || "Flexible / Not specified"}
                      </span>
                    </div>
                    {selectedOrder.reference_link && (
                      <div className="col-span-2 sm:col-span-3 min-w-0">
                        <span className="text-xs text-muted-foreground block">Inspiration Link</span>
                        <a
                          href={selectedOrder.reference_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-xs break-all mt-0.5"
                        >
                          <span className="truncate max-w-[280px] sm:max-w-md">{selectedOrder.reference_link}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Message */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project Details / Message
                  </h4>
                  <div className="p-4 rounded-lg bg-card border text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {selectedOrder.message}
                    {selectedOrder.message ? (
                      selectedOrder.message
                    ) : (
                      <span className="text-muted-foreground italic">
                        No written project details provided (refer to inspiration photos or link).
                      </span>
                    )}
                  </div>
                </div>

                {/* Reference Images Gallery */}
                {selectedOrder.reference_images && selectedOrder.reference_images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reference Images ({selectedOrder.reference_images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedOrder.reference_images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-lg border overflow-hidden bg-muted cursor-pointer"
                          onClick={() => setPreviewImage(imgUrl)}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Reference ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                            <Eye className="h-4 w-4" /> Click to view
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update & Actions Footer */}
              <div className="pt-3 border-t shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Status:</span>
                  <Select
                    value={selectedOrder.status.toLowerCase()}
                    onValueChange={(val) => val && handleStatusChange(selectedOrder.id, val)}
                    disabled={updatingId === selectedOrder.id || isPending}
                  >
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CUSTOM_ORDER_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedOrder)}
                    className="h-9 text-xs"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                  <Link
                    href={`/admin/custom-orders/${selectedOrder.id}`}
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                      className: "h-9 text-xs",
                    })}
                  >
                    Full Details Page <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox / Zoom Dialog for Reference Images */}
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] p-3 bg-background/95 backdrop-blur-xs border overflow-hidden">
          <div className="relative w-full h-[70vh] flex items-center justify-center">
            {previewImage && (
              <Image
                src={previewImage}
                alt="Enlarged reference image"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
              />
            )}
          </div>
          <div className="flex justify-end p-2 border-t">
            {previewImage && (
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open Full Resolution
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
