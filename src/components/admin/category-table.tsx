"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  UploadCloud, 
  Edit, 
  Trash2, 
  ExternalLink, 
  FolderTree, 
  Loader2, 
  ImageIcon, 
  Check, 
  Sparkles,
  X 
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  AdminCategory, 
  createCategory, 
  updateCategory, 
  updateCategoryCoverImage, 
  deleteCategory 
} from "@/actions/admin-categories";
import { toast } from "sonner";

interface CategoryTableProps {
  initialCategories: AdminCategory[];
}

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [altText, setAltText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isModalUploading, setIsModalUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // File input refs for inline quick upload
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
  });

  // Open Dialog for New Category
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setAltText("");
    setDialogOpen(true);
  };

  // Open Dialog for Editing Category
  const handleOpenEditModal = (cat: AdminCategory) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setCoverImage(cat.cover_image);
    setAltText(cat.alt_text || "");
    setDialogOpen(true);
  };

  // AI Suggestions Handler for Category Alt Text & Description
  const handleSuggestAI = async () => {
    if (!coverImage && !name.trim()) {
      toast.error("Please enter a category name or upload a cover photo first.");
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading("AI is analyzing category and generating SEO metadata...");

    try {
      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "category",
          imageUrl: coverImage || undefined,
          name: name.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        if (result.data.altText) {
          setAltText(result.data.altText);
        }
        if (result.data.description && (!description || description.trim() === "")) {
          setDescription(result.data.description);
        }
        toast.success("AI suggestions generated! Review or edit before saving.", { id: toastId });
      } else {
        toast.error(`AI suggestion failed: ${result.error || "Unknown error"}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Error generating AI suggestions: ${err.message}`, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Auto-generate slug when typing name in Add mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  // Generic Cloudinary upload handler (respects dev vs prod)
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "anjori-arts/categories");

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to upload image");
    }
    return data.url;
  };

  // Inline Quick Photo Upload (directly from table row)
  const handleInlineFileChange = async (cat: AdminCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(cat.id);
    const toastId = toast.loading(`Uploading photo for ${cat.name}...`);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (!uploadedUrl) throw new Error("No URL returned");

      const res = await updateCategoryCoverImage(cat.id, uploadedUrl);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, cover_image: uploadedUrl } : c))
        );
        toast.success(`Updated cover photo for ${cat.name}!`, { id: toastId });
        router.refresh();
      } else {
        toast.error(`Failed to save: ${res.message}`, { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingId(null);
      if (e.target) e.target.value = "";
    }
  };

  // Modal File Upload
  const handleModalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsModalUploading(true);
    const toastId = toast.loading("Uploading cover photo...");

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (!uploadedUrl) throw new Error("No URL returned");

      setCoverImage(uploadedUrl);
      toast.success("Cover photo uploaded!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setIsModalUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save Add/Edit Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isEditing ? "Updating category..." : "Creating category...");

    try {
      if (isEditing && editingId) {
        const res = await updateCategory(editingId, {
          name,
          slug,
          description,
          cover_image: coverImage,
          alt_text: altText,
        });

        if (res.success) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? {
                    ...c,
                    name: name.trim(),
                    slug: slug.trim(),
                    description: description.trim(),
                    cover_image: coverImage,
                    alt_text: altText.trim(),
                  }
                : c
            )
          );
          toast.success("Category updated successfully", { id: toastId });
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(`Error: ${res.message}`, { id: toastId });
        }
      } else {
        const res = await createCategory({
          name,
          slug,
          description,
          cover_image: coverImage,
          alt_text: altText,
        });

        if (res.success && res.id) {
          setCategories((prev) => [
            ...prev,
            {
              id: res.id!,
              name: name.trim(),
              slug: slug.trim(),
              description: description.trim(),
              cover_image: coverImage,
              alt_text: altText.trim(),
              artworkCount: 0,
            },
          ]);
          toast.success("Category created successfully", { id: toastId });
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(`Error: ${res.message}`, { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category
  const handleDelete = async (cat: AdminCategory) => {
    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      return;
    }

    const toastId = toast.loading("Deleting category...");
    try {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        toast.success("Category deleted", { id: toastId });
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete category", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Failed to delete category", { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories or slugs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={handleOpenAddModal} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Cover</TableHead>
              <TableHead className="w-[200px]">Name & Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-center">Artworks</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No categories found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => {
                const isUploadingThis = uploadingId === cat.id;

                return (
                  <TableRow key={cat.id} className="group">
                    {/* Cover Thumbnail with Quick Upload Overlay */}
                    <TableCell>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[cat.id] = el;
                        }}
                        onChange={(e) => handleInlineFileChange(cat, e)}
                        disabled={isUploadingThis}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[cat.id]?.click()}
                        className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted/40 transition-all hover:border-primary group/thumb cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary"
                        title="Click to upload/change cover photo"
                        disabled={isUploadingThis}
                      >
                        {cat.cover_image ? (
                          <Image
                            src={cat.cover_image}
                            alt={cat.alt_text || cat.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6 opacity-40" />
                          </div>
                        )}

                        {/* Hover / Loading Overlay */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity ${
                            isUploadingThis ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-100"
                          }`}
                        >
                          {isUploadingThis ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          ) : (
                            <UploadCloud className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </button>
                    </TableCell>

                    {/* Category Name & Slug */}
                    <TableCell>
                      <div className="font-semibold text-foreground">{cat.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        /{cat.slug}
                      </div>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {cat.description || <span className="italic text-muted-foreground/60">No description provided</span>}
                      </p>
                    </TableCell>

                    {/* Artwork Count */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-normal">
                        {cat.artworkCount} {cat.artworkCount === 1 ? "piece" : "pieces"}
                      </Badge>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Photo Upload Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fileInputRefs.current[cat.id]?.click()}
                          title="Upload cover photo to Cloudinary"
                          disabled={isUploadingThis}
                        >
                          {isUploadingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <UploadCloud className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>

                        {/* View Live Category Page */}
                        <Link
                          href={`/categories/${cat.slug}`}
                          target="_blank"
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                          title="View on live website"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>

                        {/* Edit Category Modal Trigger */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        {/* Delete Category */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update category details and cover image."
                : "Create a new Indian art category for your gallery catalog."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category Name *
              </label>
              <Input
                placeholder="e.g. Pichwai Painting"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Slug (URL Identifier) *
              </label>
              <Input
                placeholder="e.g. pichwai-painting"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Will be accessible at: /categories/{slug || "your-slug"}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <Textarea
                placeholder="Brief description of the art form and heritage..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Cover Image Uploader */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cover Photo (Cloudinary)
              </label>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={modalFileInputRef}
                onChange={handleModalFileChange}
                disabled={isModalUploading}
              />

              <div className="flex items-center gap-3">
                {coverImage ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={coverImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute top-0.5 right-0.5 rounded-full bg-black/70 p-0.5 text-white hover:bg-destructive"
                      title="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                    <ImageIcon className="size-6 opacity-40" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => modalFileInputRef.current?.click()}
                    disabled={isModalUploading}
                  >
                    {isModalUploading ? (
                      <>
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 size-3.5" />
                        {coverImage ? "Replace Photo" : "Upload Photo"}
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Uploads to anjori-arts/{process.env.NODE_ENV === "production" ? "prod" : "dev"}/categories/
                  </p>
                </div>
              </div>
            </div>

            {/* Image Alt Text (SEO & Accessibility) with AI Suggestion */}
            <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Image Alt Text (SEO &amp; A11y)
                  </label>
                  <span
                    className="inline-flex size-4 items-center justify-center rounded-full bg-muted-foreground/15 text-[10px] font-bold text-muted-foreground cursor-help"
                    title="Describes this image for Google Image Search and screen readers. If left blank, a smart default is used automatically."
                  >
                    i
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestAI}
                  disabled={isGeneratingAI || isModalUploading || (!coverImage && !name.trim())}
                  className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5 px-2"
                  title="Analyze image & category with Gemini AI to generate SEO alt text & description"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {isGeneratingAI ? "Generating..." : "Suggest with AI"}
                </Button>
              </div>

              <Input
                placeholder={
                  name.trim()
                    ? `Default: Handmade ${name.trim()} paintings and traditional Indian art collection`
                    : "Default: Handmade art paintings and traditional Indian art collection"
                }
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="bg-background"
              />

              <p className="text-[11px] text-muted-foreground">
                {altText.trim() ? (
                  <span className="text-primary font-medium">✓ Custom alt text set for Google Images &amp; screen readers.</span>
                ) : (
                  <span>Leave blank to use the smart default shown in placeholder.</span>
                )}
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isModalUploading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
