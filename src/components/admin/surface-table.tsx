"use client";

import { useState, useTransition } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle,
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  AdminSurface, 
  createSurface, 
  updateSurface, 
  toggleSurfaceActive, 
  deleteSurface,
  reorderSurfaces 
} from "@/actions/admin-surfaces";
import { toast } from "sonner";

interface SurfaceTableProps {
  initialSurfaces: AdminSurface[];
}

const POPULAR_PRESETS = [
  { name: "Tussar Silk", slug: "tussar-silk", display_order: 35 },
  { name: "Handmade Rice Paper", slug: "handmade-rice-paper", display_order: 25 },
  { name: "Teakwood Board", slug: "teakwood-board", display_order: 32 },
  { name: "Terracotta Clay Plate", slug: "terracotta-clay-plate", display_order: 40 },
  { name: "Palm Leaf (Talapatra)", slug: "palm-leaf", display_order: 45 },
  { name: "Marble Board", slug: "marble-board", display_order: 50 },
  { name: "Pure Cotton Canvas", slug: "cotton-canvas", display_order: 12 },
];

export function SurfaceTable({ initialSurfaces }: SurfaceTableProps) {
  const [surfaces, setSurfaces] = useState<AdminSurface[]>(initialSurfaces);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSurface, setDeletingSurface] = useState<AdminSurface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filteredSurfaces = surfaces.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
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
    // Default next order to highest order + 10
    const highestOrder = surfaces.reduce((max, s) => Math.max(max, s.display_order), 0);
    setDisplayOrder(highestOrder + 10);
    setIsActive(true);
    setIsSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (surface: AdminSurface) => {
    setIsEditing(true);
    setEditingId(surface.id);
    setName(surface.name);
    setSlug(surface.slug);
    setDisplayOrder(surface.display_order);
    setIsActive(surface.is_active);
    setIsSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleSelectPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setSlug(preset.slug);
    setDisplayOrder(preset.display_order);
    setIsSlugManuallyEdited(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Surface name is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required.");
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && editingId) {
        const res = await updateSurface(editingId, {
          name: name.trim(),
          slug: slug.trim(),
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        });

        if (res.success) {
          toast.success("Surface updated successfully!");
          setSurfaces((prev) =>
            prev
              .map((s) =>
                s.id === editingId
                  ? {
                      ...s,
                      name: name.trim(),
                      slug: slug.trim(),
                      display_order: Number(displayOrder) || 0,
                      is_active: isActive,
                    }
                  : s
              )
              .sort((a, b) => a.display_order - b.display_order)
          );
          setModalOpen(false);
        } else {
          toast.error(res.message || "Failed to update surface.");
        }
      } else {
        const res = await createSurface({
          name: name.trim(),
          slug: slug.trim(),
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        });

        if (res.success && res.id) {
          toast.success("Surface created successfully!");
          const newSurface: AdminSurface = {
            id: res.id,
            name: name.trim(),
            slug: slug.trim(),
            display_order: Number(displayOrder) || 0,
            is_active: isActive,
            created_at: new Date().toISOString(),
            artworkCount: 0,
          };
          setSurfaces((prev) =>
            [...prev, newSurface].sort((a, b) => a.display_order - b.display_order)
          );
          setModalOpen(false);
        } else {
          toast.error(res.message || "Failed to create surface.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (surface: AdminSurface) => {
    const nextState = !surface.is_active;
    setTogglingId(surface.id);

    // Optimistic update
    setSurfaces((prev) =>
      prev.map((s) => (s.id === surface.id ? { ...s, is_active: nextState } : s))
    );

    try {
      const res = await toggleSurfaceActive(surface.id, nextState);
      if (res.success) {
        toast.success(
          `Surface "${surface.name}" ${nextState ? "activated" : "deactivated"}.`
        );
      } else {
        // Revert on failure
        setSurfaces((prev) =>
          prev.map((s) => (s.id === surface.id ? { ...s, is_active: !nextState } : s))
        );
        toast.error(res.message || "Failed to toggle status.");
      }
    } catch {
      setSurfaces((prev) =>
        prev.map((s) => (s.id === surface.id ? { ...s, is_active: !nextState } : s))
      );
      toast.error("Failed to toggle status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDeleteModal = (surface: AdminSurface) => {
    setDeletingSurface(surface);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSurface) return;

    setIsDeleting(true);
    try {
      const res = await deleteSurface(deletingSurface.id);
      if (res.success) {
        toast.success(`Surface "${deletingSurface.name}" deleted.`);
        setSurfaces((prev) => prev.filter((s) => s.id !== deletingSurface.id));
        setDeleteModalOpen(false);
        setDeletingSurface(null);
      } else {
        toast.error(res.message || "Failed to delete surface.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (search.trim()) {
      toast.error("Clear search to reorder positions.");
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= surfaces.length) return;

    const updated = [...surfaces];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    const reindexed = updated.map((s, idx) => ({
      ...s,
      display_order: (idx + 1) * 10,
    }));

    setSurfaces(reindexed);

    try {
      const res = await reorderSurfaces(reindexed.map((s) => s.id));
      if (!res.success) {
        setSurfaces(surfaces);
        toast.error(res.message || "Failed to save reordering.");
      }
    } catch {
      setSurfaces(surfaces);
      toast.error("Failed to save reordering.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search surfaces by name or slug..."
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
          Add Surface
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px] font-semibold text-foreground">Surface</TableHead>
                <TableHead className="font-semibold text-foreground">Slug</TableHead>
                <TableHead className="w-[130px] font-semibold text-foreground text-center">
                  Position
                </TableHead>
                <TableHead className="w-[140px] font-semibold text-foreground text-center">
                  Artworks
                </TableHead>
                <TableHead className="w-[140px] font-semibold text-foreground text-center">
                  Status
                </TableHead>
                <TableHead className="w-[120px] text-right font-semibold text-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurfaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Layers className="h-8 w-8 stroke-[1.5] text-muted-foreground/60" />
                      <p className="text-base font-medium">No surfaces found</p>
                      <p className="text-xs text-muted-foreground">
                        {search
                          ? `No matches for "${search}". Try searching for something else.`
                          : "Get started by adding your first artwork surface."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurfaces.map((surface) => {
                  const realIndex = surfaces.findIndex((s) => s.id === surface.id);
                  const isFirst = realIndex === 0;
                  const isLast = realIndex === surfaces.length - 1;

                  return (
                    <TableRow key={surface.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Layers className="size-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">
                              {surface.name}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden mt-0.5">
                              #{realIndex + 1} • {surface.artworkCount} artworks
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {surface.slug}
                        </code>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted-foreground w-6 text-right">
                            #{realIndex + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMove(realIndex, "up")}
                              disabled={isFirst || !!search.trim()}
                              title={search.trim() ? "Clear search to reorder" : "Move up"}
                              aria-label={`Move ${surface.name} up`}
                              className="inline-flex size-7 items-center justify-center rounded border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronUp className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(realIndex, "down")}
                              disabled={isLast || !!search.trim()}
                              title={search.trim() ? "Clear search to reorder" : "Move down"}
                              aria-label={`Move ${surface.name} down`}
                              className="inline-flex size-7 items-center justify-center rounded border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronDown className="size-4" />
                            </button>
                          </div>
                        </div>
                      </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={surface.artworkCount > 0 ? "secondary" : "outline"}
                        className="font-mono text-xs font-normal"
                      >
                        {surface.artworkCount}{" "}
                        {surface.artworkCount === 1 ? "piece" : "pieces"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(surface)}
                        disabled={togglingId === surface.id}
                        aria-label={`Toggle status for ${surface.name}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-h-[32px]"
                      >
                        {surface.is_active ? (
                          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                            <Check className="size-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground gap-1">
                            <X className="size-3" />
                            Inactive
                          </Badge>
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(surface)}
                          aria-label={`Edit ${surface.name}`}
                          className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <Edit2 className="size-4" />
                          <span className="sr-only">Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(surface)}
                          aria-label={`Delete ${surface.name}`}
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

      {/* Add / Edit Surface Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {isEditing ? "Edit Surface" : "New Artwork Surface"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditing
                ? "Update surface name, display order, or active status."
                : "Add a substrate or surface option for artworks and commissions."}
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
              <Label htmlFor="surface-name">
                Surface Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="surface-name"
                placeholder="e.g. Stretched Canvas, Tussar Silk"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface-slug">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="surface-slug"
                placeholder="e.g. stretched-canvas"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                required
                className="h-10 font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Unique identifier used in system lookups and URLs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display-order">Display Order</Label>
                <Input
                  id="display-order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  Lower numbers appear first in dropdowns.
                </p>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Label htmlFor="surface-status" className="mb-2">
                  Active in Forms
                </Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    id="surface-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
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
                {isEditing ? "Save Changes" : "Create Surface"}
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
              Delete Surface &quot;{deletingSurface?.name}&quot;?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              {deletingSurface && deletingSurface.artworkCount > 0 ? (
                <span className="text-destructive font-medium block">
                  Cannot delete this surface because {deletingSurface.artworkCount} artwork(s)
                  are currently assigned to it.
                </span>
              ) : (
                "Are you sure you want to delete this surface? This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>

          {deletingSurface && deletingSurface.artworkCount > 0 ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <p>
                <strong>Recommendation:</strong> Instead of deleting, switch the surface
                status to <strong>Inactive</strong>. This keeps all existing artworks intact
                while hiding this surface from new artwork and commission dropdowns.
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
              disabled={isDeleting || (deletingSurface ? deletingSurface.artworkCount > 0 : false)}
              className="min-h-[44px] cursor-pointer"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Surface
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

