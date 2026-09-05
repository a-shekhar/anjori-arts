"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Layers,
  Maximize2,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCustomOrderAgreedSpecs } from "@/actions/admin-custom-orders";
import { toast } from "sonner";
import type { CustomOrder } from "@/types";

interface CustomOrderSpecsCardProps {
  order: CustomOrder;
  categoryOptions?: string[];
  surfaceOptions?: string[];
  mediumOptions?: string[];
}

const DEFAULT_MEDIUMS = [
  "Acrylic on Canvas",
  "Oil on Canvas",
  "Madhubani Natural Dyes & Ink",
  "Pichwai Natural Stone Pigments",
  "Watercolor on Handmade Paper",
  "Ink & Nib Pen",
  "Mixed Media & Gold Foil",
  "Charcoal / Graphite",
  "Resin & Wood",
  "Acrylic",
  "Oil",
];

const COMMON_SIZE_PRESETS = [
  "12 x 12 in",
  "18 x 24 in",
  "24 x 36 in",
  "30 x 40 in",
  "Framed",
];

export function CustomOrderSpecsCard({
  order,
  categoryOptions = [],
  surfaceOptions = [],
  mediumOptions = [],
}: CustomOrderSpecsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOriginalBrief, setShowOriginalBrief] = useState(false);

  // Helper to parse comma-separated mediums into an array
  const parseMediums = (mediumStr?: string | null): string[] => {
    if (!mediumStr) return [];
    return mediumStr
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  };

  // Editable specification state
  const [category, setCategory] = useState(
    order.final_category || order.category || ""
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>(() =>
    parseMediums(order.final_medium || order.medium)
  );
  const [customMediumInput, setCustomMediumInput] = useState("");
  const [surface, setSurface] = useState(
    order.final_surface || order.surface || ""
  );
  const [size, setSize] = useState(
    order.final_size || order.preferred_size || ""
  );
  const [budget, setBudget] = useState(
    order.final_budget || order.budget || ""
  );

  const hasAgreedSpecs = Boolean(
    order.final_category ||
      order.final_medium ||
      order.final_surface ||
      order.final_size ||
      order.final_budget
  );

  const activeCategory = order.final_category || order.category;
  const activeMediumStr = order.final_medium || order.medium || "";
  const activeMediumsList = parseMediums(activeMediumStr);
  const activeSurface = order.final_surface || order.surface || "Open / Unspecified";
  const activeSize = order.final_size || order.preferred_size || "Flexible / Unspecified";
  const activeBudget = order.final_budget || order.budget || "Flexible";

  const availableMediumList =
    mediumOptions.length > 0 ? mediumOptions : DEFAULT_MEDIUMS;

  const handleOpenDialog = () => {
    setCategory(order.final_category || order.category || "");
    setSelectedMediums(parseMediums(order.final_medium || order.medium));
    setCustomMediumInput("");
    setSurface(order.final_surface || order.surface || "");
    setSize(order.final_size || order.preferred_size || "");
    setBudget(order.final_budget || order.budget || "");
    setIsDialogOpen(true);
  };

  const handleResetToOriginal = () => {
    setCategory(order.category || "");
    setSelectedMediums(parseMediums(order.medium));
    setCustomMediumInput("");
    setSurface(order.surface || "");
    setSize(order.preferred_size || "");
    setBudget(order.budget || "");
    toast.info("Prefilled with customer's original inquiry specifications");
  };

  const handleToggleMedium = (mediumName: string) => {
    setSelectedMediums((prev) => {
      if (prev.includes(mediumName)) {
        return prev.filter((m) => m !== mediumName);
      } else {
        return [...prev, mediumName];
      }
    });
  };

  const handleAddCustomMedium = () => {
    const trimmed = customMediumInput.trim();
    if (!trimmed) return;
    if (!selectedMediums.includes(trimmed)) {
      setSelectedMediums((prev) => [...prev, trimmed]);
    }
    setCustomMediumInput("");
  };

  const handleRemoveMedium = (mediumToRemove: string) => {
    setSelectedMediums((prev) => prev.filter((m) => m !== mediumToRemove));
  };

  const handleApplySizePreset = (preset: string) => {
    if (preset === "Framed") {
      if (!size) {
        setSize("Framed");
      } else if (!size.toLowerCase().includes("framed")) {
        setSize((prev) => `${prev} (Framed)`);
      }
    } else {
      if (size.toLowerCase().includes("framed")) {
        setSize(`${preset} (Framed)`);
      } else {
        setSize(preset);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving agreed commission specifications...");

    try {
      const formattedMedium =
        selectedMediums.length > 0 ? selectedMediums.join(", ") : null;

      const res = await updateCustomOrderAgreedSpecs(order.id, {
        final_category: category.trim() || null,
        final_medium: formattedMedium,
        final_surface: surface.trim() || null,
        final_size: size.trim() || null,
        final_budget: budget.trim() || null,
      });

      if (res.success) {
        toast.success("Commission specifications updated", { id: toastId });
        setIsDialogOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(`Error: ${res.message || "Failed to update"}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to update specifications", { id: toastId });
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-base font-semibold">
              Commission Specifications
            </CardTitle>
            {hasAgreedSpecs ? (
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0 border-primary/30 text-primary bg-primary/5 font-medium"
              >
                <Sparkles className="h-3 w-3 mr-1 inline text-primary" />
                Agreed with Client
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] px-2 py-0 font-normal">
                Customer Brief
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {hasAgreedSpecs
              ? "Confirmed artwork scope and materials refined after consulting with client."
              : "Specifications requested by customer. Click edit to record mutually agreed scope."}
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto shrink-0"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit Specifications
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Active / Agreed Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Art Category</span>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="font-medium text-xs">
                {activeCategory}
              </Badge>
              {order.final_category && order.final_category !== order.category && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {order.category}
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Medium</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {activeMediumsList.length > 0 ? (
                activeMediumsList.map((med, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-[11px] px-1.5 py-0 font-normal"
                  >
                    {med}
                  </Badge>
                ))
              ) : (
                <span className="text-foreground text-sm font-medium">
                  Open / Unspecified
                </span>
              )}
            </div>
            {order.final_medium && order.final_medium !== order.medium && order.medium && (
              <span className="text-[11px] text-muted-foreground block mt-1">
                Original: {order.medium}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Surface</span>
            <span className="font-medium text-foreground mt-1 block">
              {activeSurface}
            </span>
            {order.final_surface && order.final_surface !== order.surface && order.surface && (
              <span className="text-[11px] text-muted-foreground block">
                Original: {order.surface}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Agreed Dimensions / Size</span>
            <span className="font-medium text-foreground mt-1 block">
              {activeSize}
            </span>
            {order.final_size && order.final_size !== order.preferred_size && order.preferred_size && (
              <span className="text-[11px] text-muted-foreground block">
                Original: {order.preferred_size}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Agreed Budget / Target</span>
            <span className="font-medium text-foreground mt-1 block font-mono">
              {activeBudget}
            </span>
            {order.final_budget && order.final_budget !== order.budget && order.budget && (
              <span className="text-[11px] text-muted-foreground block">
                Original: {order.budget}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Reference Link</span>
            {order.reference_link ? (
              <a
                href={order.reference_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs mt-1 inline-flex items-center gap-1 truncate max-w-full"
              >
                Open External Reference
              </a>
            ) : (
              <span className="text-muted-foreground mt-1 block text-xs">None</span>
            )}
          </div>
        </div>

        {/* Expandable Original Customer Inquiry Record */}
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowOriginalBrief((prev) => !prev)}
            className="flex items-center justify-between w-full text-left py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              Original Customer Brief (Permanent Historical Record)
            </span>
            {showOriginalBrief ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showOriginalBrief && (
            <div className="mt-3 p-3.5 rounded-lg bg-muted/40 text-xs space-y-2.5 border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-muted-foreground block">Requested Art:</span>
                  <span className="font-medium text-foreground">{order.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Requested Medium:</span>
                  <span className="font-medium text-foreground">{order.medium || "Unspecified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Requested Surface:</span>
                  <span className="font-medium text-foreground">{order.surface || "Unspecified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Requested Size:</span>
                  <span className="font-medium text-foreground">{order.preferred_size || "Unspecified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Customer Budget:</span>
                  <span className="font-medium text-foreground">{order.budget || "Flexible"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Redesigned Edit Specifications Dialog (2-Column Spacious Layout) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-border bg-background">
          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            {/* Modal Header */}
            <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/10 pr-14">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Edit2 className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg font-serif font-semibold text-foreground">
                      Agreed Commission Specifications
                    </DialogTitle>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted font-medium text-muted-foreground border">
                      {order.order_reference}
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Refine mutually agreed artistic specifications and dimensions with the client.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Form Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Customer Original Inquiry Reference Card */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Info className="size-3.5 text-primary" />
                    <span>Customer&apos;s Original Request</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToOriginal}
                    className="h-7 text-xs px-2.5 gap-1.5 text-foreground hover:bg-background border-border/80 shadow-xs"
                  >
                    <RotateCcw className="size-3 text-muted-foreground" />
                    Populate from Customer Brief
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2.5 border-t border-border/60 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Category</span>
                    <p className="font-medium text-foreground truncate" title={order.category}>
                      {order.category}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Medium</span>
                    <p className="font-medium text-foreground truncate" title={order.medium || "—"}>
                      {order.medium || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Surface</span>
                    <p className="font-medium text-foreground truncate" title={order.surface || "—"}>
                      {order.surface || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Preferred Size</span>
                    <p className="font-medium text-foreground truncate" title={order.preferred_size || "—"}>
                      {order.preferred_size || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Target Budget</span>
                    <p className="font-medium text-foreground truncate" title={order.budget || "Flexible"}>
                      {order.budget || "Flexible"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Column Responsive Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Category, Surface, Budget */}
                <div className="space-y-5">
                  {/* Art Category */}
                  <div className="space-y-2">
                    <Label htmlFor="spec-category" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                      <Palette className="size-4 text-primary" />
                      Art Category <span className="text-destructive">*</span>
                    </Label>
                    {categoryOptions.length > 0 ? (
                      <div className="space-y-2">
                        <Select
                          value={categoryOptions.includes(category) ? category : "custom"}
                          onValueChange={(val) => {
                            if (!val) return;
                            if (val === "custom") {
                              setCategory(categoryOptions.includes(category) ? "" : category);
                            } else {
                              setCategory(val);
                            }
                          }}
                        >
                          <SelectTrigger id="spec-category" className="w-full text-sm h-9.5 bg-background">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-sm">
                                {cat}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className="text-sm text-primary font-medium">
                              + Custom / Other Category...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {(!categoryOptions.includes(category) || category === "custom") && (
                          <Input
                            value={category === "custom" ? "" : category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Type custom category name..."
                            className="text-sm h-9.5 bg-background"
                            required
                          />
                        )}
                      </div>
                    ) : (
                      <Input
                        id="spec-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Madhubani Painting, Tanjore Art"
                        className="text-sm h-9.5 bg-background"
                        required
                      />
                    )}
                  </div>

                  {/* Surface */}
                  <div className="space-y-2">
                    <Label htmlFor="spec-surface" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                      <Layers className="size-4 text-primary" />
                      Surface / Substrate
                    </Label>
                    {surfaceOptions.length > 0 ? (
                      <div className="space-y-2">
                        <Select
                          value={surfaceOptions.includes(surface) ? surface : "custom"}
                          onValueChange={(val) => {
                            if (!val) return;
                            if (val === "custom") {
                              setSurface(surfaceOptions.includes(surface) ? "" : surface);
                            } else {
                              setSurface(val);
                            }
                          }}
                        >
                          <SelectTrigger id="spec-surface" className="w-full text-sm h-9.5 bg-background">
                            <SelectValue placeholder="Select Surface" />
                          </SelectTrigger>
                          <SelectContent>
                            {surfaceOptions.map((surf) => (
                              <SelectItem key={surf} value={surf} className="text-sm">
                                {surf}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className="text-sm text-primary font-medium">
                              + Custom Surface...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {(!surfaceOptions.includes(surface) || surface === "custom") && (
                          <Input
                            value={surface === "custom" ? "" : surface}
                            onChange={(e) => setSurface(e.target.value)}
                            placeholder="Type custom surface material..."
                            className="text-sm h-9.5 bg-background"
                          />
                        )}
                      </div>
                    ) : (
                      <Input
                        id="spec-surface"
                        value={surface}
                        onChange={(e) => setSurface(e.target.value)}
                        placeholder="e.g. Stretched Linen Canvas, Teakwood Board"
                        className="text-sm h-9.5 bg-background"
                      />
                    )}
                  </div>

                  {/* Agreed Budget Target */}
                  <div className="space-y-2">
                    <Label htmlFor="spec-budget" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                      <Banknote className="size-4 text-primary" />
                      Agreed Budget Target
                    </Label>
                    <Input
                      id="spec-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹15,000 or Flexible"
                      className="text-sm h-9.5 bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Client target budget or agreed starting point for itemized quote.
                    </p>
                  </div>
                </div>

                {/* Right Column: Multi-Select Medium, Dimensions */}
                <div className="space-y-5">
                  {/* Medium Selection */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                        <Palette className="size-4 text-primary" />
                        Agreed Mediums
                        {selectedMediums.length > 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {selectedMediums.length}
                          </span>
                        )}
                      </Label>
                      {selectedMediums.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedMediums([])}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Quick Pick Database Medium Pills */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground font-medium block">
                        Studio Taxonomy:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableMediumList.map((med) => {
                          const isSelected = selectedMediums.includes(med);
                          return (
                            <button
                              key={med}
                              type="button"
                              onClick={() => handleToggleMedium(med)}
                              className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="size-3.5" />
                              ) : (
                                <Plus className="size-3.5 opacity-60" />
                              )}
                              {med}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Medium Chips Display */}
                    {selectedMediums.length > 0 && (
                      <div className="p-2.5 rounded-lg border bg-muted/20 flex flex-wrap items-center gap-1.5">
                        {selectedMediums.map((med) => (
                          <Badge
                            key={med}
                            variant="secondary"
                            className="text-xs py-1 pl-2.5 pr-1 gap-1.5 font-medium bg-background border shadow-2xs"
                          >
                            {med}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedium(med)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                              aria-label={`Remove ${med}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Custom Medium Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={customMediumInput}
                        onChange={(e) => setCustomMediumInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomMedium();
                          }
                        }}
                        placeholder="Add another medium..."
                        className="text-sm h-9 flex-1 bg-background"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddCustomMedium}
                        disabled={!customMediumInput.trim()}
                        className="h-9 text-xs shrink-0 gap-1 px-3"
                      >
                        <Plus className="size-3.5" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Agreed Dimensions / Size with Presets */}
                  <div className="space-y-2">
                    <Label htmlFor="spec-size" className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                      <Maximize2 className="size-4 text-primary" />
                      Agreed Dimensions / Size
                    </Label>
                    <Input
                      id="spec-size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="e.g. 24 x 36 in (Framed)"
                      className="text-sm h-9.5 bg-background"
                    />

                    {/* Size Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-muted-foreground font-medium mr-0.5">Popular:</span>
                      {COMMON_SIZE_PRESETS.map((preset) => {
                        const isPresetApplied = size.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleApplySizePreset(preset)}
                            className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                              isPresetApplied
                                ? "bg-primary/10 text-primary border-primary/30 font-medium"
                                : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isPresetApplied ? "✓ " : ""}{preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 flex flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
                className="h-9 px-4 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="h-9 px-5 text-xs font-medium gap-1.5 shadow-xs"
              >
                {isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Save Specifications
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
