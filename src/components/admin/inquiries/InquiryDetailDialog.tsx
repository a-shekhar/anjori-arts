"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  User,
  Tag,
  Trash2,
  Paintbrush,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  ALL_INQUIRY_STATUSES,
  formatInquiryStatus,
  formatInquiryCategory,
  getInquiryStatusBadgeVariant,
  buildInquiryWhatsAppUrl,
  buildInquiryMailtoUrl,
} from "@/lib/inquiries";
import { toast } from "sonner";
import type { Inquiry } from "@/types";

interface InquiryDetailDialogProps {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
  onNotesSaved: (id: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InquiryDetailDialog({
  inquiry,
  open,
  onOpenChange,
  onStatusChange,
  onNotesSaved,
  onDelete,
}: InquiryDetailDialogProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setAdminNotes(inquiry.admin_notes || "");
      setShowDeleteConfirm(false);
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const whatsappUrl = buildInquiryWhatsAppUrl(inquiry);
  const mailtoUrl = buildInquiryMailtoUrl(inquiry);

  const formattedDate = new Date(inquiry.created_at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await onNotesSaved(inquiry.id, adminNotes);
      toast.success("Admin notes saved successfully.");
    } catch {
      toast.error("Failed to save admin notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusSelect = async (newStatus: string) => {
    try {
      setIsChangingStatus(true);
      await onStatusChange(inquiry.id, newStatus);
      toast.success(`Status updated to ${formatInquiryStatus(newStatus)}.`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(inquiry.id);
      toast.success("Inquiry deleted successfully.");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isCustomArtworkLead =
    inquiry.category.toLowerCase().includes("custom") ||
    inquiry.subject.toLowerCase().includes("custom") ||
    inquiry.subject.toLowerCase().includes("commission");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-wider text-muted-foreground">
                {inquiry.inquiry_reference}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getInquiryStatusBadgeVariant(
                  inquiry.status
                )}`}
              >
                {formatInquiryStatus(inquiry.status)}
              </span>
            </div>

            {/* Quick Status Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Status:</span>
              <Select
                value={inquiry.status}
                onValueChange={(val) => {
                  if (val) handleStatusSelect(val);
                }}
                disabled={isChangingStatus}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent align="end">
                  {ALL_INQUIRY_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-xs">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogTitle className="text-xl font-serif font-bold text-foreground">
            {inquiry.subject}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Received on {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Customer Profile Card */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Customer Details
              </h3>
              <Badge variant="outline" className="text-xs font-normal">
                <Tag className="mr-1 h-3 w-3" /> {formatInquiryCategory(inquiry.category)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">
                  {inquiry.first_name} {inquiry.last_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground break-all">{inquiry.email}</span>
                  <a
                    href={mailtoUrl}
                    title="Send Email"
                    className="text-primary hover:text-primary/80 transition-colors p-1"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {inquiry.phone ? (
                <div>
                  <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {inquiry.country_code} {inquiry.phone}
                    </span>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors p-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                    <a
                      href={`tel:${inquiry.country_code}${inquiry.phone}`}
                      title="Call Phone"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-xs text-muted-foreground italic">Not provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Artwork Cross-Link Recommendation */}
          {isCustomArtworkLead && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-start gap-2">
                <Paintbrush className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Custom Artwork Inquiry Detected</p>
                  <p className="text-muted-foreground mt-0.5">
                    This inquiry mentions custom artwork or commissions. You can manage ongoing commissions in Custom Orders.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/custom-orders"
                className={buttonVariants({ variant: "outline", size: "xs", className: "shrink-0 text-xs" })}
              >
                Go to Custom Orders
              </Link>
            </div>
          )}

          {/* Customer Message Body */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Message
            </Label>
            <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground select-text">
              {inquiry.message}
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Staff / Internal Notes
              </Label>
              <span className="text-[11px] text-muted-foreground">Private to team</span>
            </div>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record call summaries, client preferences, or follow-up details..."
              rows={3}
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSavingNotes || adminNotes === (inquiry.admin_notes || "")}
                className="text-xs gap-1.5"
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> Save Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t pt-4">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-2 rounded-lg text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Permanently delete?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2 text-xs"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1 h-8"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Inquiry
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1.5 h-8" })}
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
              </a>
            )}
            <a
              href={mailtoUrl}
              className={buttonVariants({ variant: "default", size: "sm", className: "text-xs gap-1.5 h-8" })}
            >
              <Mail className="h-3.5 w-3.5" /> Reply by Email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
