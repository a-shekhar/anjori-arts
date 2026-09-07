"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Inbox,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  X,
  FileText,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
  type AdminInquiryStats,
} from "@/actions/admin-inquiries";
import {
  ALL_INQUIRY_STATUSES,
  INQUIRY_CATEGORIES,
  formatInquiryStatus,
  formatInquiryCategory,
  getInquiryStatusBadgeVariant,
  buildInquiryWhatsAppUrl,
  buildInquiryMailtoUrl,
} from "@/lib/inquiries";
import { InquiryDetailDialog } from "./InquiryDetailDialog";
import { toast } from "sonner";
import type { Inquiry, InquiryStatus } from "@/types";

interface AdminInquiriesTableProps {
  initialInquiries: Inquiry[];
  stats: AdminInquiryStats;
}

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All Inquiries" },
  { key: "new", label: "New" },
  { key: "reviewed", label: "Reviewed" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "archived", label: "Archived" },
];

export function AdminInquiriesTable({
  initialInquiries,
  stats: initialStats,
}: AdminInquiriesTableProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog States
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute metrics dynamically from current state
  const currentStats = useMemo(() => {
    const s = {
      total: inquiries.length,
      newCount: 0,
      reviewedCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      archivedCount: 0,
    };
    for (const inq of inquiries) {
      const status = (inq.status || "new").toLowerCase();
      if (status === "new") s.newCount++;
      else if (status === "reviewed") s.reviewedCount++;
      else if (status === "in_progress") s.inProgressCount++;
      else if (status === "resolved") s.resolvedCount++;
      else if (status === "archived") s.archivedCount++;
    }
    return s;
  }, [inquiries]);

  // Unique categories list with formatted labels
  const uniqueCategories = useMemo(() => {
    const map = new Map<string, string>();
    INQUIRY_CATEGORIES.forEach((cat) => map.set(cat.value, cat.label));
    inquiries.forEach((inq) => {
      if (inq.category && !map.has(inq.category)) {
        map.set(inq.category, formatInquiryCategory(inq.category));
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [inquiries]);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Tab filter
      if (activeTab !== "all" && (item.status || "new").toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
        const matchRef = item.inquiry_reference.toLowerCase().includes(q);
        const matchName = fullName.includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchPhone = (item.phone || "").toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchMessage = item.message.toLowerCase().includes(q);
        const matchNotes = (item.admin_notes || "").toLowerCase().includes(q);

        return (
          matchRef ||
          matchName ||
          matchEmail ||
          matchPhone ||
          matchSubject ||
          matchMessage ||
          matchNotes
        );
      }

      return true;
    });
  }, [inquiries, activeTab, categoryFilter, search]);

  // Handlers
  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await updateInquiryStatus(id, newStatus);
    if (!res.success) {
      throw new Error(res.message || "Failed to update status");
    }

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus as InquiryStatus } : inq))
    );

    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus as InquiryStatus } : null));
    }
  };

  const handleNotesSaved = async (id: string, notes: string) => {
    const res = await updateInquiryNotes(id, notes);
    if (!res.success) {
      throw new Error(res.message || "Failed to save notes");
    }

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, admin_notes: notes } : inq))
    );

    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, admin_notes: notes } : null));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteInquiry(id);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete inquiry");
    }

    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry(null);
      setIsDetailOpen(false);
    }
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await handleDelete(deleteTargetId);
      toast.success("Inquiry deleted successfully.");
      setDeleteTargetId(null);
    } catch {
      toast.error("Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const getTabCount = (key: string) => {
    if (key === "all") return currentStats.total;
    if (key === "new") return currentStats.newCount;
    if (key === "reviewed") return currentStats.reviewedCount;
    if (key === "in_progress") return currentStats.inProgressCount;
    if (key === "resolved") return currentStats.resolvedCount;
    if (key === "archived") return currentStats.archivedCount;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">
              Customer Inquiries
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {currentStats.total} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review incoming questions, respond via Email or WhatsApp, and track customer lead resolution.
          </p>
        </div>
        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", className: "min-h-[44px] h-11" })}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Public Form
        </Link>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Inquiries</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              All messages received to date
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
              New / Awaiting
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
              {currentStats.newCount}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
              Unread inquiries requiring response
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-200">
              In Progress
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">
              {currentStats.inProgressCount}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-1">
              Active communication / research
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Resolved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {currentStats.resolvedCount}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Completed and satisfied queries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm border-b">
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar and Category Select */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search reference, name, email, subject, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 min-h-[44px] h-11 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="min-h-[44px] min-w-[44px] absolute right-0 top-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full sm:w-[220px]">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  if (val) setCategoryFilter(val);
                }}
              >
                <SelectTrigger className="min-h-[44px] h-11 text-xs sm:text-sm">
                  <SelectValue placeholder="All Inquiry Types" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Inquiry Types</SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(search || categoryFilter !== "all" || activeTab !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setActiveTab("all");
                }}
                className="min-h-[44px] text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </div>
      </div>

      {/* Main Content: Table on Desktop, Cards on Mobile */}
      {filteredInquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center space-y-3 bg-muted/10">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h3 className="text-base font-semibold">No inquiries found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || categoryFilter !== "all" || activeTab !== "all"
              ? "No inquiries match your current search filters. Try clearing filters or searching for another keyword."
              : "No customer inquiries have been received yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block rounded-xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[140px]">Reference / Date</TableHead>
                  <TableHead className="w-[200px]">Customer</TableHead>
                  <TableHead>Category &amp; Subject</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => {
                  const whatsappUrl = buildInquiryWhatsAppUrl(inquiry);
                  const mailtoUrl = buildInquiryMailtoUrl(inquiry);
                  const formattedDate = new Date(inquiry.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <TableRow key={inquiry.id} className="hover:bg-muted/30 transition-colors">
                      {/* Reference & Date */}
                      <TableCell className="align-top">
                        <button
                          type="button"
                          onClick={() => openDetailDialog(inquiry)}
                          className="font-mono text-xs font-bold text-foreground hover:text-primary transition-colors block text-left"
                        >
                          {inquiry.inquiry_reference}
                        </button>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </TableCell>

                      {/* Customer Info */}
                      <TableCell className="align-top">
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm text-foreground">
                            {inquiry.first_name} {inquiry.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {inquiry.email}
                          </p>
                          {inquiry.phone && (
                            <p className="text-[11px] text-muted-foreground">
                              {inquiry.country_code} {inquiry.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Category & Subject / Snippet */}
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px] font-normal">
                              {formatInquiryCategory(inquiry.category)}
                            </Badge>
                            {inquiry.admin_notes && (
                              <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                                <FileText className="h-2.5 w-2.5" /> Note
                              </Badge>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => openDetailDialog(inquiry)}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors text-left line-clamp-1"
                          >
                            {inquiry.subject}
                          </button>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status Dropdown */}
                      <TableCell className="align-top">
                        <Select
                          value={inquiry.status}
                          onValueChange={(val) => {
                            if (val) handleStatusChange(inquiry.id, val);
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs w-[120px] font-medium border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {ALL_INQUIRY_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value} className="text-xs">
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick WhatsApp */}
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Chat on WhatsApp"
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}

                          {/* Quick Email */}
                          <a
                            href={mailtoUrl}
                            aria-label="Reply by Email"
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors"
                            title="Reply by Email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>

                          {/* Detail Modal Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="View Inquiry Details"
                            onClick={() => openDetailDialog(inquiry)}
                            className="min-h-[36px] min-w-[36px] p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-foreground" />
                          </Button>

                          {/* More Options */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button
                                  type="button"
                                  aria-label="More actions"
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(inquiry)}>
                                <Eye className="mr-2 h-4 w-4" /> View Full Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTargetId(inquiry.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Inquiry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout (< 768px) */}
          <div className="grid gap-3 md:hidden">
            {filteredInquiries.map((inquiry) => {
              const whatsappUrl = buildInquiryWhatsAppUrl(inquiry);
              const mailtoUrl = buildInquiryMailtoUrl(inquiry);
              const formattedDate = new Date(inquiry.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={inquiry.id}
                  className="rounded-xl border bg-card p-4 space-y-3 shadow-xs"
                >
                  {/* Card Header: Ref & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => openDetailDialog(inquiry)}
                        className="font-mono text-xs font-bold text-foreground hover:text-primary"
                      >
                        {inquiry.inquiry_reference}
                      </button>
                      <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getInquiryStatusBadgeVariant(
                        inquiry.status
                      )}`}
                    >
                      {formatInquiryStatus(inquiry.status)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {inquiry.first_name} {inquiry.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                    {inquiry.phone && (
                      <p className="text-xs text-muted-foreground">
                        {inquiry.country_code} {inquiry.phone}
                      </p>
                    )}
                  </div>

                  {/* Subject & Snippet */}
                  <div className="rounded-lg bg-muted/30 p-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground line-clamp-1">
                        {inquiry.subject}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {formatInquiryCategory(inquiry.category)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Card Actions (Accessible 44px touch targets) */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(inquiry)}
                      className="min-h-[44px] flex-1 text-xs gap-1.5"
                    >
                      <Eye className="h-4 w-4" /> View Details
                    </Button>

                    <div className="flex items-center gap-1">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="WhatsApp customer"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <a
                        href={mailtoUrl}
                        aria-label="Email customer"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border text-primary hover:bg-primary/10"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Inquiry Detail Dialog */}
      <InquiryDetailDialog
        inquiry={selectedInquiry}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onStatusChange={handleStatusChange}
        onNotesSaved={handleNotesSaved}
        onDelete={handleDelete}
      />

      {/* Standalone Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Delete Inquiry</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
              disabled={isDeleting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDeleteTarget}
              disabled={isDeleting}
              className="min-h-[44px]"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

