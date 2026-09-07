"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  Upload,
  X,
  Loader2,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  toggleTestimonialApproval,
  toggleTestimonialFeatured,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
} from "@/actions/admin-testimonials";
import type { Testimonial } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TestimonialTableProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialTable({ initialTestimonials }: TestimonialTableProps) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "featured">("all");

  // Modal dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form image upload state
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [createAltText, setCreateAltText] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini AI Alt Text Handler
  const handleSuggestAltAI = async (mode: "create" | "edit") => {
    setIsGeneratingAI(true);
    const toastId = toast.loading("Gemini Vision is analyzing the room photograph...");

    try {
      let targetImageUrl = mode === "edit" ? (selectedItem?.image_url || "") : "";

      // If a local un-uploaded file is selected, upload it first to get a public URL for Gemini
      if (formImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formImageFile);
        uploadFormData.append("folder", "anjori-arts/testimonials");

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || "Failed to upload image for AI analysis");
        }
        targetImageUrl = uploadData.url;
      }

      if (!targetImageUrl) {
        toast.error("Please upload or select an image first before asking Gemini.", { id: toastId });
        return;
      }

      const artworkTitle = mode === "edit"
        ? (document.getElementById("edit-artworkTitle") as HTMLInputElement)?.value
        : (document.getElementById("create-artworkTitle") as HTMLInputElement)?.value;
      const authorName = mode === "edit"
        ? (document.getElementById("edit-authorName") as HTMLInputElement)?.value
        : (document.getElementById("create-authorName") as HTMLInputElement)?.value;
      const authorLocation = mode === "edit"
        ? (document.getElementById("edit-authorLocation") as HTMLInputElement)?.value
        : (document.getElementById("create-authorLocation") as HTMLInputElement)?.value;

      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "testimonial",
          imageUrl: targetImageUrl,
          artworkTitle,
          authorName,
          authorLocation,
        }),
      });

      const result = await res.json();
      if (result.success && result.data?.altText) {
        if (mode === "edit") {
          setEditAltText(result.data.altText);
        } else {
          setCreateAltText(result.data.altText);
        }
        toast.success("Gemini generated SEO Alt Text! Review or edit before saving.", { id: toastId });
      } else {
        toast.error(`Gemini suggestion failed: ${result.error || "Unknown error"}`, { id: toastId });
      }
    } catch (err: any) {
      console.error("Error generating Gemini alt text:", err);
      toast.error(`Gemini Error: ${err.message || "Could not analyze image"}`, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filter calculations
  const pendingCount = testimonials.filter((t) => !t.is_approved).length;
  const approvedCount = testimonials.filter((t) => t.is_approved).length;
  const featuredCount = testimonials.filter((t) => t.is_featured).length;

  const filteredTestimonials = testimonials.filter((t) => {
    // Status filter
    if (statusFilter === "pending" && t.is_approved) return false;
    if (statusFilter === "approved" && !t.is_approved) return false;
    if (statusFilter === "featured" && !t.is_featured) return false;

    // Search query
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      t.author_name.toLowerCase().includes(query) ||
      (t.author_location && t.author_location.toLowerCase().includes(query)) ||
      (t.artwork_title && t.artwork_title.toLowerCase().includes(query)) ||
      t.quote.toLowerCase().includes(query)
    );
  });

  // Handle toggling approval
  const handleToggleApproval = async (item: Testimonial) => {
    const nextState = !item.is_approved;
    const prev = [...testimonials];

    setTestimonials((curr) =>
      curr.map((t) => (t.id === item.id ? { ...t, is_approved: nextState } : t))
    );

    const result = await toggleTestimonialApproval(item.id, nextState);
    if (!result.success) {
      setTestimonials(prev);
      toast.error(result.error || "Failed to update approval status.");
    } else {
      toast.success(
        nextState
          ? `Approved story by ${item.author_name} (Now visible to public)`
          : `Story by ${item.author_name} marked as unapproved`
      );
      router.refresh();
    }
  };

  // Handle toggling featured
  const handleToggleFeatured = async (item: Testimonial) => {
    const nextState = !item.is_featured;
    const prev = [...testimonials];

    setTestimonials((curr) =>
      curr.map((t) => (t.id === item.id ? { ...t, is_featured: nextState } : t))
    );

    const result = await toggleTestimonialFeatured(item.id, nextState);
    if (!result.success) {
      setTestimonials(prev);
      toast.error(result.error || "Failed to update featured status.");
    } else {
      toast.success(
        nextState
          ? `Story by ${item.author_name} featured on homepage`
          : `Removed ${item.author_name} from homepage featured`
      );
      router.refresh();
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const result = await deleteAdminTestimonial(selectedItem.id);
      if (result.success) {
        setTestimonials((curr) => curr.filter((t) => t.id !== selectedItem.id));
        toast.success("Testimonial deleted successfully.");
        setIsDeleteOpen(false);
        setSelectedItem(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete testimonial.");
      }
    } catch (err) {
      toast.error("Unexpected error during deletion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create form submit
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (formImageFile) {
        formData.set("imageFile", formImageFile);
      }

      const result = await createAdminTestimonial(formData);
      if (result.success) {
        toast.success("New testimonial created and saved successfully!");
        setIsAddOpen(false);
        setFormImageFile(null);
        setFormImagePreview(null);
        router.refresh();
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to create testimonial.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit form submit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (formImageFile) {
        formData.set("imageFile", formImageFile);
      }
      if (selectedItem.image_url) {
        formData.set("existingImageUrl", selectedItem.image_url);
      }

      const result = await updateAdminTestimonial(selectedItem.id, formData);
      if (result.success) {
        toast.success("Testimonial updated successfully!");
        setIsEditOpen(false);
        setSelectedItem(null);
        setFormImageFile(null);
        setFormImagePreview(null);
        router.refresh();
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update testimonial.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Header */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Stories</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-foreground">
            {testimonials.length}
          </p>
        </div>

        <div className={cn(
          "rounded-2xl border p-5 shadow-xs transition-colors",
          pendingCount > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"
        )}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase">Pending Review</p>
            {pendingCount > 0 && (
              <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className={cn(
            "mt-2 font-serif text-3xl font-semibold",
            pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
          )}>
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground uppercase">Approved (Live)</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground uppercase">Featured on Home</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-primary">
            {featuredCount}
          </p>
        </div>
      </div>

      {/* Action Bar & Tabs */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({testimonials.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              statusFilter === "pending" ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              statusFilter === "approved" ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("featured")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              statusFilter === "featured" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Featured ({featuredCount})
          </button>
        </div>

        {/* Search & Add button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search author or quote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 rounded-xl text-xs"
            />
          </div>

          <Button
            onClick={() => {
              setFormImageFile(null);
              setFormImagePreview(null);
              setIsAddOpen(true);
            }}
            className="h-10 rounded-xl px-4 text-xs shrink-0"
          >
            <Plus className="mr-1.5 size-4" /> Add Testimonial
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Collector & Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-xs">Story / Review</TableHead>
              <TableHead>Artwork / Style</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="mx-auto max-w-md space-y-2 py-6">
                    <p className="font-medium text-foreground text-sm">No collector stories found</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you haven&apos;t run the database migration yet, execute{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
                        supabase/migrations/20260906002000_testimonials.sql
                      </code>{" "}
                      in your Supabase SQL Editor. You can also click &ldquo;Add Testimonial&rdquo; to create your first story.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  {/* Photo Thumbnail */}
                  <TableCell>
                    {item.image_url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(item.image_url || null)}
                        className="group relative size-12 overflow-hidden rounded-xl border border-border bg-secondary"
                        title="Click to preview photograph"
                      >
                        <Image
                          src={item.image_url}
                          alt={item.author_name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                          <Eye className="size-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground">
                        {item.author_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </TableCell>

                  {/* Collector Name & Location */}
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{item.author_name}</p>
                    <p className="text-xs text-muted-foreground">{item.author_location || "Location not set"}</p>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < item.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>

                  {/* Story Excerpt */}
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-xs text-foreground/90 leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </TableCell>

                  {/* Artwork Tag */}
                  <TableCell>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.artwork_title || "General Commission"}
                    </span>
                  </TableCell>

                  {/* Status Badges */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {item.is_approved ? (
                        <Badge variant="outline" className="w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                          <CheckCircle2 className="mr-1 size-3" /> Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                          <Clock className="mr-1 size-3" /> Pending Review
                        </Badge>
                      )}

                      {item.is_featured && (
                        <Badge variant="secondary" className="w-fit text-[10px]">
                          <Sparkles className="mr-1 size-3 text-primary" /> Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Approve / Unapprove Toggle Button */}
                      <Button
                        type="button"
                        size="sm"
                        variant={item.is_approved ? "outline" : "default"}
                        onClick={() => handleToggleApproval(item)}
                        className={cn(
                          "h-8 rounded-lg text-xs font-medium",
                          !item.is_approved && "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                        title={item.is_approved ? "Unapprove story" : "Approve & publish to site"}
                      >
                        {item.is_approved ? "Unpublish" : "Approve"}
                      </Button>

                      {/* Feature on Home Toggle */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFeatured(item)}
                        className={cn(
                          "h-8 px-2.5 rounded-lg text-xs",
                          item.is_featured ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                        title={item.is_featured ? "Remove from home" : "Feature on homepage"}
                      >
                        <Sparkles className="size-3.5" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedItem(item);
                          setFormImageFile(null);
                          setFormImagePreview(item.image_url || null);
                          setEditAltText(item.image_alt || "");
                          setIsEditOpen(true);
                        }}
                        className="h-8 px-2 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Edit details"
                      >
                        <Edit className="size-3.5" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 px-2 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Delete story"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle>Collector Living Space Photograph</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image src={previewImage} alt="Preview" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this collector story by{" "}
              <strong>{selectedItem?.author_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Testimonial Modal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Testimonial (Admin Direct Entry)</DialogTitle>
            <DialogDescription>
              Paste feedback and photos received over WhatsApp, Instagram, or email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-authorName" className="text-xs font-medium">
                  Collector Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-authorName"
                  name="authorName"
                  required
                  placeholder="e.g. Radhika M."
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-authorLocation" className="text-xs font-medium">
                  City / Location
                </Label>
                <Input
                  id="create-authorLocation"
                  name="authorLocation"
                  placeholder="e.g. Mumbai, MH"
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-artworkTitle" className="text-xs font-medium">
                  Artwork or Tradition Tag
                </Label>
                <Input
                  id="create-artworkTitle"
                  name="artworkTitle"
                  placeholder="e.g. Kamdhenu Pichwai (36×24 in)"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-rating" className="text-xs font-medium">
                  Rating (1 to 5 stars)
                </Label>
                <Input
                  id="create-rating"
                  name="rating"
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={5}
                  required
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-quote" className="text-xs font-medium">
                Review / Collector Words <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="create-quote"
                name="quote"
                rows={4}
                required
                minLength={10}
                placeholder="Paste the message received from collector..."
                className="rounded-xl text-xs resize-y"
              />
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Living Space Photograph (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="create-photo-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormImageFile(file);
                    setFormImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              {!formImagePreview ? (
                <label
                  htmlFor="create-photo-input"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                >
                  <Upload className="size-4 text-primary" /> Upload Photo from WhatsApp
                </label>
              ) : (
                <div className="relative inline-block overflow-hidden rounded-xl border border-border">
                  <div className="relative h-32 w-48">
                    <Image src={formImagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormImageFile(null);
                      setFormImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Image Alt Text with Gemini Suggest Button */}
            {formImagePreview && (
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-imageAlt" className="text-xs font-medium">
                    Image Alt Text (SEO &amp; Accessibility)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isGeneratingAI}
                    onClick={() => handleSuggestAltAI("create")}
                    className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3" />
                        Suggest with Gemini
                      </>
                    )}
                  </Button>
                </div>
                <Input
                  id="create-imageAlt"
                  name="imageAlt"
                  value={createAltText}
                  onChange={(e) => setCreateAltText(e.target.value)}
                  placeholder="e.g. Framed Pichwai painting mounted on an earthy wall in a living room foyer"
                  className="rounded-xl h-10 text-xs bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  Descriptive text indexed by Google Image Search and read by screen readers.
                </p>
              </div>
            )}

            {/* Publishing options */}
            <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="isApproved"
                  value="true"
                  defaultChecked
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                Publish immediately (Approved)
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  value="true"
                  defaultChecked
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                Feature on Homepage
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save Testimonial
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Modal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Modify collector details, review text, or change publication status.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-authorName" className="text-xs font-medium">
                    Collector Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-authorName"
                    name="authorName"
                    defaultValue={selectedItem.author_name}
                    required
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-authorLocation" className="text-xs font-medium">
                    City / Location
                  </Label>
                  <Input
                    id="edit-authorLocation"
                    name="authorLocation"
                    defaultValue={selectedItem.author_location || ""}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-artworkTitle" className="text-xs font-medium">
                    Artwork or Tradition Tag
                  </Label>
                  <Input
                    id="edit-artworkTitle"
                    name="artworkTitle"
                    defaultValue={selectedItem.artwork_title || ""}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-rating" className="text-xs font-medium">
                    Rating (1 to 5)
                  </Label>
                  <Input
                    id="edit-rating"
                    name="rating"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={selectedItem.rating}
                    required
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-quote" className="text-xs font-medium">
                  Review / Collector Words <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="edit-quote"
                  name="quote"
                  rows={4}
                  required
                  defaultValue={selectedItem.quote}
                  className="rounded-xl text-xs resize-y"
                />
              </div>

              {/* Photo upload / replace */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Living Space Photograph</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  id="edit-photo-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormImageFile(file);
                      setFormImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {!formImagePreview ? (
                  <label
                    htmlFor="edit-photo-input"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Upload className="size-4 text-primary" /> Upload New Photograph
                  </label>
                ) : (
                  <div className="relative inline-block overflow-hidden rounded-xl border border-border">
                    <div className="relative h-32 w-48">
                      <Image src={formImagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageFile(null);
                        setFormImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Image Alt Text with Gemini Suggest Button */}
              {(formImagePreview || selectedItem.image_url) && (
                <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-imageAlt" className="text-xs font-medium">
                      Image Alt Text (SEO &amp; Accessibility)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isGeneratingAI}
                      onClick={() => handleSuggestAltAI("edit")}
                      className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Analyzing with Gemini...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3" />
                          Suggest with Gemini
                        </>
                      )}
                    </Button>
                  </div>
                  <Input
                    id="edit-imageAlt"
                    name="imageAlt"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="e.g. Framed Pichwai painting mounted on an earthy wall in a living room foyer"
                    className="rounded-xl h-10 text-xs bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Descriptive text indexed by Google Image Search and read by screen readers.
                  </p>
                </div>
              )}

              {/* Publishing options */}
              <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    name="isApproved"
                    value="true"
                    defaultChecked={selectedItem.is_approved}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Approved (Visible on public site)
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    value="true"
                    defaultChecked={selectedItem.is_featured}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Featured on Homepage
                </label>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Update Testimonial
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

