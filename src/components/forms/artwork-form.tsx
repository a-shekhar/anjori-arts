"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UploadCloud, X, Image as ImageIcon, Wand2 } from "lucide-react";
import { createArtwork, updateArtwork } from "@/actions/admin-artworks";
import { artworkSchema, ArtworkFormValues } from "@/lib/validations/artwork";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type TaxonomyData = {
  categories: { id: string; name: string; slug: string }[];
  surfaces: { id: string; name: string; slug: string }[];
  mediums: { id: string; name: string; slug: string }[];
};

type Props = {
  initialData?: any;
  taxonomies: TaxonomyData;
};

export function ArtworkForm({ initialData, taxonomies }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const form = useForm<ArtworkFormValues>({
    // @ts-ignore: ZodResolver type mismatch with useForm
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      categoryId: initialData?.categoryId || "",
      surfaceId: initialData?.surfaceId || null,
      mediumIds: initialData?.mediumIds || [],
      price: initialData?.price || 0,
      dimensions: initialData?.dimensions || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      artistNote: initialData?.artistNote || "",
      tags: initialData?.tags || "",
      isAvailable: initialData?.isAvailable ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      images: initialData?.images || [],
      variants: initialData?.variants?.length ? initialData.variants : [{ label: "Base/Unframed", widthInches: 0, heightInches: 0, mrp: 0, sellingPrice: 0, stockQuantity: 1, isActive: true, canBeFramed: false, framingPrice: 0 }],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const generateSku = (index: number) => {
    const categoryId = form.getValues("categoryId");
    const category = taxonomies.categories.find(c => c.id === categoryId);
    let catPrefix = category ? category.name.substring(0, 3).toUpperCase() : "ART";
    
    // For initials, just use the first letter of each word in the title
    const title = form.getValues("title") || "";
    const titleInitials = title.split(/\s+/).map(w => w[0]?.toUpperCase()).join("").substring(0, 3) || "XX";
    
    const variant = form.getValues(`variants.${index}`);
    const w = variant?.widthInches || 0;
    const h = variant?.heightInches || 0;
    const framed = variant?.canBeFramed ? "-F" : "";
    
    // Format: CAT-INIT-WxH[-F] e.g. MAD-RK-1624-F
    const sku = `${catPrefix}-${titleInitials}-${w}${h}${framed}`;
    form.setValue(`variants.${index}.sku`, sku, { shouldDirty: true, shouldValidate: true });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
    if (!isEditing && !form.formState.dirtyFields.slug) {
      form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      formData.append("folder", `anjori-arts/artworks/${form.getValues("slug") || "new"}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        appendImage({ url: data.url, alt: "", publicId: data.publicId });
        toast.success("Image uploaded", { id: toastId });
      } else {
        toast.error(`Upload failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred during upload", { id: toastId });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ""; // Reset input
    }
  };

  const handleGenerateGlobalAI = async () => {
    const images = form.getValues("images");
    if (!images || images.length === 0 || !images[0].url) {
      toast.error("Please upload an image first.");
      return;
    }
    
    setIsGeneratingAI(true);
    const toastId = toast.loading("AI is analyzing your artwork...");
    
    try {
      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: images[0].url }),
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        // Apply data
        form.setValue("title", result.data.title || "", { shouldDirty: true, shouldValidate: true });
        // Optionally update slug if not editing
        if (!isEditing && !form.formState.dirtyFields.slug) {
           form.setValue("slug", (result.data.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldDirty: true });
        }
        form.setValue("shortDescription", result.data.shortDescription || "", { shouldDirty: true });
        form.setValue("description", result.data.description || "", { shouldDirty: true });
        
        // Tags
        if (result.data.tags) {
          form.setValue("tags", result.data.tags, { shouldDirty: true });
        }
        
        // Alt text for first image
        if (result.data.altText) {
          form.setValue("images.0.alt", result.data.altText, { shouldDirty: true });
        }
        
        toast.success("SEO fields auto-filled successfully!", { id: toastId });
      } else {
        toast.error(`AI generation failed: ${result.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred during AI generation", { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleMedium = (mediumId: string) => {
    const current = form.getValues("mediumIds") || [];
    if (current.includes(mediumId)) {
      form.setValue("mediumIds", current.filter(id => id !== mediumId), { shouldDirty: true });
    } else {
      form.setValue("mediumIds", [...current, mediumId], { shouldDirty: true });
    }
  };

  const onSubmit = (values: any) => {
    // Derive base price and dimensions from the first variant
    if (values.variants && values.variants.length > 0) {
      values.price = values.variants[0].sellingPrice;
      values.dimensions = `${values.variants[0].widthInches}" × ${values.variants[0].heightInches}"`;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(values));

      const res = isEditing 
        ? await updateArtwork(initialData.id, null, formData)
        : await createArtwork(null, formData);

      if (res.success) {
        toast.success(`Artwork ${isEditing ? "updated" : "created"} successfully!`);
        router.push("/admin/artworks");
      } else {
        toast.error(`Error: ${res.message}`);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Artwork" : "New Artwork"}</h2>
          <p className="text-muted-foreground">Manage details, images, and variants.</p>
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/artworks")} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending || isUploading}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Artwork"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input id="title" {...form.register("title")} onChange={handleTitleChange} />
                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                <Input id="slug" {...form.register("slug")} />
                {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select 
                    value={form.watch("categoryId")} 
                    onValueChange={(val) => form.setValue("categoryId", val || "", { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.watch("categoryId") ? taxonomies.categories.find(c => c.id === form.watch("categoryId"))?.name : "Select Category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {taxonomies.categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Surface (Optional)</Label>
                  <Select 
                    value={form.watch("surfaceId") || "none"} 
                    onValueChange={(val) => form.setValue("surfaceId", val === "none" ? null : val, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.watch("surfaceId") ? taxonomies.surfaces.find(s => s.id === form.watch("surfaceId"))?.name : "Select Surface"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {taxonomies.surfaces.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Mediums</Label>
                <div className="flex flex-wrap gap-2">
                  {taxonomies.mediums.map(m => {
                    const isSelected = form.watch("mediumIds")?.includes(m.id);
                    return (
                      <Badge 
                        key={m.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleMedium(m.id)}
                      >
                        {m.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" {...form.register("tags")} placeholder="e.g. handmade, modern, nature" />
              </div>
            </CardContent>
          </Card>


          {/* Story & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea id="shortDescription" {...form.register("shortDescription")} rows={2} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Full Description (Markdown) <span className="text-destructive">*</span></Label>
                <Textarea id="description" {...form.register("description")} rows={6} className="font-mono text-sm" />
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="artistNote">Artist's Note (Optional)</Label>
                <Textarea id="artistNote" {...form.register("artistNote")} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variants & Pricing <span className="text-destructive">*</span></CardTitle>
                <CardDescription>Add base sizes and framing options. The first variant serves as the base price.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ label: "", widthInches: 0, heightInches: 0, mrp: 0, sellingPrice: 0, stockQuantity: -1, isActive: true, canBeFramed: false, framingPrice: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.formState.errors.variants && <p className="text-sm text-destructive">{form.formState.errors.variants.root?.message || form.formState.errors.variants.message}</p>}
              {variantFields.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">No variants added.</p>
              ) : (
                <div className="space-y-6">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/20">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeVariant(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Hidden input to preserve the variant ID if it exists */}
                        <input type="hidden" {...form.register(`variants.${index}.id`)} />
                        
                        <div className="grid gap-2 col-span-full md:col-span-1">
                          <Label>Variant Label</Label>
                          <Input {...form.register(`variants.${index}.label`)} placeholder="e.g. Framed 16x20" />
                          {form.formState.errors.variants?.[index]?.label && <p className="text-sm text-destructive">{form.formState.errors.variants[index]?.label?.message}</p>}
                        </div>

                        <div className="grid gap-2 col-span-full md:col-span-1">
                          <Label>SKU (Optional)</Label>
                          <div className="flex gap-2">
                            <Input {...form.register(`variants.${index}.sku`)} placeholder="e.g. ART-123-F" />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => generateSku(index)}
                              title="Auto-generate SKU"
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Width (inches)</Label>
                          <Input type="number" step="0.1" {...form.register(`variants.${index}.widthInches`, { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Height (inches)</Label>
                          <Input type="number" step="0.1" {...form.register(`variants.${index}.heightInches`, { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Stock Qty (-1 for unlimited)</Label>
                          <Input type="number" {...form.register(`variants.${index}.stockQuantity`, { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>MRP (₹)</Label>
                          <Input type="number" {...form.register(`variants.${index}.mrp`, { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Selling Price (₹)</Label>
                          <Input type="number" {...form.register(`variants.${index}.sellingPrice`, { valueAsNumber: true })} />
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-dashed">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-0.5">
                            <Label>Available with Frame?</Label>
                            <p className="text-sm text-muted-foreground">Offer an optional frame for this specific size.</p>
                          </div>
                          <Switch 
                            checked={form.watch(`variants.${index}.canBeFramed`)} 
                            onCheckedChange={(val) => form.setValue(`variants.${index}.canBeFramed`, val, { shouldDirty: true })} 
                          />
                        </div>
                        {form.watch(`variants.${index}.canBeFramed`) && (
                          <div className="grid gap-2 max-w-xs">
                            <Label>Framing Add-on Price (₹)</Label>
                            <Input type="number" step="0.01" {...form.register(`variants.${index}.framingPrice`, { valueAsNumber: true })} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-8">
          {/* Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isAvailable">Available / In Stock</Label>
                  <p className="text-sm text-muted-foreground">Is this artwork ready for purchase?</p>
                </div>
                <Switch 
                  id="isAvailable" 
                  checked={form.watch("isAvailable")} 
                  onCheckedChange={(val) => form.setValue("isAvailable", val, { shouldDirty: true })} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Featured</Label>
                  <p className="text-sm text-muted-foreground">Highlight on homepage & top of shop.</p>
                </div>
                <Switch 
                  id="isFeatured" 
                  checked={form.watch("isFeatured")} 
                  onCheckedChange={(val) => form.setValue("isFeatured", val, { shouldDirty: true })} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Images <span className="text-destructive">*</span></CardTitle>
                <CardDescription>First image is used as the cover thumbnail.</CardDescription>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleGenerateGlobalAI} disabled={isGeneratingAI || imageFields.length === 0}>
                <Wand2 className="mr-2 h-4 w-4" /> Auto-fill SEO (AI)
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">Upload an image</p>
                <p className="text-xs text-muted-foreground mb-4">PNG, JPG or WebP up to 10MB</p>
                
                <div className="relative">
                  <Button type="button" variant="secondary" disabled={isUploading}>
                    {isUploading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Browse Files</>}
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>

              {form.formState.errors.images && <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>}

              <div className="space-y-3">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-center border rounded-md p-2 bg-background">
                    <div className="h-16 w-16 relative rounded-sm overflow-hidden bg-muted flex-shrink-0">
                      <img src={form.watch(`images.${index}.url`)} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 grid gap-2">
                      <Input {...form.register(`images.${index}.url`)} placeholder="Image URL" className="h-7 text-xs" />
                      <Input {...form.register(`images.${index}.alt`)} placeholder="Alt text (optional)" className="h-7 text-xs" />
                      <input type="hidden" {...form.register(`images.${index}.publicId`)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button type="button" variant="link" className="px-0 text-xs" onClick={() => appendImage({ url: "", alt: "", publicId: "" })}>
                + Add Image by URL
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
