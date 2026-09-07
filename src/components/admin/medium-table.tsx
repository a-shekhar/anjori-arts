"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Pipette, 
  Loader2, 
  X, 
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AdminMedium, 
  createMedium, 
  updateMedium, 
  deleteMedium,
} from "@/actions/admin-mediums";
import { toast } from "sonner";

interface MediumTableProps {
  initialMediums: AdminMedium[];
}

const POPULAR_PRESETS = [
  {
    name: "Natural Vegetable & Mineral Dyes",
    slug: "natural-dyes",
    description: "Organic plant extracts, indigo, turmeric, and mineral earth pigments.",
  },
  {
    name: "24k Gold Foil & Chalk Paste",
    slug: "gold-foil",
    description: "Authentic 24-carat gold leaf embossing with limestone paste.",
  },
  {
    name: "Rice Flour Pigment & Gum",
    slug: "rice-pigment",
    description: "Traditional Warli rice paste mixed with natural tree resin water.",
  },
  {
    name: "Natural Stone Colors & Gouache",
    slug: "stone-colors",
    description: "Hand-ground semi-precious stone pigments used in Pichwai and miniature art.",
  },
  {
    name: "Acrylic Colors",
    slug: "acrylic",
    description: "Fast-drying, rich acrylic emulsion paints.",
  },
  {
    name: "Oil Paints",
    slug: "oil",
    description: "Traditional slow-drying artist linseed oil paints.",
  },
  {
    name: "Watercolors",
    slug: "watercolor",
    description: "Transparent gum-arabic based watercolor washes.",
  },
];

export function MediumTable({ initialMediums }: MediumTableProps) {
  const [mediums, setMediums] = useState<AdminMedium[]>(() =>
    [...initialMediums].sort((a, b) => a.name.localeCompare(b.name))
  );
  const [search, setSearch] = useState("");

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingMedium, setDeletingMedium] = useState<AdminMedium | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  const filteredMediums = mediums.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (medium: AdminMedium) => {
    setIsEditing(true);
    setEditingId(medium.id);
    setName(medium.name);
    setSlug(medium.slug);
    setDescription(medium.description);
    setIsSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleSelectPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setSlug(preset.slug);
    setDescription(preset.description);
    setIsSlugManuallyEdited(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Medium name is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required.");
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && editingId) {
        const res = await updateMedium(editingId, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
        });

        if (res.success) {
          toast.success("Medium updated successfully!");
          setMediums((prev) =>
            prev
              .map((m) =>
                m.id === editingId
                  ? {
                      ...m,
                      name: name.trim(),
                      slug: slug.trim(),
                      description: description.trim(),
                    }
                  : m
              )
              .sort((a, b) => a.name.localeCompare(b.name))
          );
          setModalOpen(false);
        } else {
          toast.error(res.message || "Failed to update medium.");
        }
      } else {
        const res = await createMedium({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
        });

        if (res.success && res.id) {
          toast.success("Medium created successfully!");
          const newMedium: AdminMedium = {
            id: res.id,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            display_order: 0,
            created_at: new Date().toISOString(),
            artworkCount: 0,
          };
          setMediums((prev) =>
            [...prev, newMedium].sort((a, b) => a.name.localeCompare(b.name))
          );
          setModalOpen(false);
        } else {
          toast.error(res.message || "Failed to create medium.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteModal = (medium: AdminMedium) => {
    setDeletingMedium(medium);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMedium) return;

    setIsDeleting(true);
    try {
      const res = await deleteMedium(deletingMedium.id);
      if (res.success) {
        toast.success(`Medium "${deletingMedium.name}" deleted.`);
        setMediums((prev) => prev.filter((m) => m.id !== deletingMedium.id));
        setDeleteModalOpen(false);
        setDeletingMedium(null);
      } else {
        toast.error(res.message || "Failed to delete medium.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mediums by name, slug, or technique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-sm bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="min-h-[44px] gap-2 px-5 font-medium shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Medium
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px] font-semibold text-foreground">Medium & Pigment</TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground">Slug</TableHead>
                <TableHead className="font-semibold text-foreground">Description</TableHead>
                <TableHead className="w-[140px] font-semibold text-foreground text-center">
                  Artworks
                </TableHead>
                <TableHead className="w-[120px] text-right font-semibold text-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMediums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Pipette className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
                      <p className="text-base font-medium">No mediums found</p>
                      <p className="text-xs text-muted-foreground">
                        {search
                          ? `No matches for "${search}". Try searching for something else.`
                          : "Get started by adding your first art medium or pigment."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMediums.map((medium) => {
                  return (
                    <TableRow key={medium.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Pipette className="size-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">
                              {medium.name}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden mt-0.5 line-clamp-1">
                              {medium.description || "No description provided"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {medium.slug}
                        </code>
                      </TableCell>

                      <TableCell className="max-w-[280px]">
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {medium.description || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={medium.artworkCount > 0 ? "secondary" : "outline"}
                          className="font-mono text-xs font-normal"
                        >
                          {medium.artworkCount}{" "}
                          {medium.artworkCount === 1 ? "piece" : "pieces"}
                        </Badge>
                      </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(medium)}
                          aria-label={`Edit ${medium.name}`}
                          className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <Edit2 className="size-4" />
                          <span className="sr-only">Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(medium)}
                          aria-label={`Delete ${medium.name}`}
                          className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Medium Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {isEditing ? "Edit Medium" : "New Art Medium"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditing
                ? "Update medium name, slug, or technique description."
                : "Add a color, dye, pigment, or medium option for artworks and commissions."}
            </DialogDescription>
          </DialogHeader>

          {!isEditing && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-primary mb-2">
                <Sparkles className="size-3.5" />
                <span>Quick Presets for Indian Folk Arts:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRESETS.map((preset) => (
                  <button
                    key={preset.slug}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="rounded-md border border-primary/20 bg-background px-2 py-1 text-xs text-foreground transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="medium-name">
                Medium Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="medium-name"
                placeholder="e.g. Natural Vegetable Dyes, Acrylic"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium-slug">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="medium-slug"
                placeholder="e.g. natural-dyes"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                required
                className="h-10 font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Unique identifier used in database relationships and URLs.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium-description">Description (Optional)</Label>
              <Textarea
                id="medium-description"
                placeholder="Details on pigment source, binders, or traditional application methods..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] text-sm resize-y"
              />
            </div>

            <DialogFooter className="pt-4 gap-3 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] cursor-pointer"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Medium"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-lg font-serif">
              Delete Medium &quot;{deletingMedium?.name}&quot;?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              {deletingMedium && deletingMedium.artworkCount > 0 ? (
                <span className="text-destructive font-medium block">
                  Cannot delete this medium because {deletingMedium.artworkCount} artwork(s)
                  are currently using it.
                </span>
              ) : (
                "Are you sure you want to delete this medium? This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>

          {deletingMedium && deletingMedium.artworkCount > 0 ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <p>
                <strong>Notice:</strong> To delete this medium, please first edit the assigned
                artworks and unselect this medium tag.
              </p>
            </div>
          ) : null}

          <DialogFooter className="pt-3 gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || (deletingMedium ? deletingMedium.artworkCount > 0 : false)}
              className="min-h-[44px] cursor-pointer"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Medium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

