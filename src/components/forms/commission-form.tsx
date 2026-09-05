"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { toast } from "sonner";
import { Send, Image as ImageIcon, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import Image from "next/image";
import { CUSTOM_ORDER_IMAGE_LIMITS } from "@/lib/validations/contact";

interface CommissionFormProps {
  categories: string[];
  mediums: string[];
  surfaces: string[];
  defaultCategory?: string;
  defaultDetails?: string;
  artworkId?: string;
}

export function CommissionForm({ categories, mediums, surfaces, defaultCategory, defaultDetails, artworkId }: CommissionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isImagesExpanded, setIsImagesExpanded] = React.useState(true);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const matchedCategory = defaultCategory && categories.includes(defaultCategory) ? defaultCategory : (defaultCategory ? "Other" : "");
  const [selectedCategory, setSelectedCategory] = React.useState<string>(matchedCategory);
  const [selectedMedium, setSelectedMedium] = React.useState<string>("");
  const [selectedSurface, setSelectedSurface] = React.useState<string>("");

  // Cleanup object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      // Append files to formData manually since we manage them in React state
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Handle Category
      const customCat = (formData.get("customCategory") as string)?.trim();
      if (selectedCategory === "Other") {
        formData.set("category", customCat || "Other");
      } else if (selectedCategory) {
        formData.set("category", selectedCategory);
      }
      formData.delete("customCategory");
      formData.delete("categorySelect");

      // Handle Medium
      const customMed = (formData.get("customMedium") as string)?.trim();
      if (selectedMedium === "Other") {
        formData.set("medium", customMed || "Other");
      } else if (selectedMedium) {
        formData.set("medium", selectedMedium);
      } else {
        formData.delete("medium");
      }
      formData.delete("customMedium");
      formData.delete("mediumSelect");

      // Handle Surface
      const customSurf = (formData.get("customSurface") as string)?.trim();
      if (selectedSurface === "Other") {
        formData.set("surface", customSurf || "Other");
      } else if (selectedSurface) {
        formData.set("surface", selectedSurface);
      } else {
        formData.delete("surface");
      }
      formData.delete("customSurface");
      formData.delete("surfaceSelect");

      const response = await fetch("/api/custom-order", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();

      if (result.success) {
        toast.success("Order request sent successfully!", {
          description: `We'll review your request. Your reference is ${result.orderReference}.`,
        });
        form.reset();
        setSelectedFiles([]);
        setPreviews([]);
        setSelectedCategory("");
        setSelectedMedium("");
        setSelectedSurface("");
      } else {
        toast.error("Failed to send request", {
          description: result.error || "Please try again later.",
        });
      }
    } catch {
      toast.error("An unexpected error occurred while sending your request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      
      // Limit to max files
      if (filesArray.length > CUSTOM_ORDER_IMAGE_LIMITS.maxFiles) {
        toast.error(`You can only upload up to ${CUSTOM_ORDER_IMAGE_LIMITS.maxFiles} images.`);
        return;
      }
      
      // Validate file size
      for (const file of filesArray) {
        if (file.size > CUSTOM_ORDER_IMAGE_LIMITS.maxFileSizeBytes) {
          toast.error(`File too large: ${file.name}. Max size is 5MB.`);
          return;
        }
      }
      
      setSelectedFiles(filesArray);
      
      // Create preview URLs
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    } else {
      setSelectedFiles([]);
      setPreviews([]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {artworkId && <input type="hidden" name="artworkId" value={artworkId} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required placeholder="Doe" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required placeholder="john@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number (optional)</Label>
        <div className="flex gap-2">
          <div className="w-[110px] shrink-0">
            <CountryCodeSelect name="countryCode" defaultValue="+91" />
          </div>
          <Input id="phone" name="phone" type="tel" placeholder="98765 43210" className="flex-1" />
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <div className="relative">
            <select
              id="category"
              name="categorySelect"
              required
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="min-h-[44px] h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
            >
              <option className="bg-background text-foreground" value="" disabled>Select category</option>
              {categories.map((category) => (
                <option className="bg-background text-foreground" key={category} value={category}>{category}</option>
              ))}
              <option className="bg-background text-foreground" value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medium">Medium (Optional)</Label>
          <div className="relative">
            <select
              id="medium"
              name="mediumSelect"
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="min-h-[44px] h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
            >
              <option className="bg-background text-foreground" value="" disabled>Select medium</option>
              {mediums.map((medium) => (
                <option className="bg-background text-foreground" key={medium} value={medium}>{medium.charAt(0).toUpperCase() + medium.slice(1)}</option>
              ))}
              <option className="bg-background text-foreground" value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="surface">Preferred Surface (Optional)</Label>
          <div className="relative">
            <select
              id="surface"
              name="surfaceSelect"
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
              className="min-h-[44px] h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
            >
              <option className="bg-background text-foreground" value="" disabled>Select surface</option>
              {surfaces.map((surface) => (
                <option className="bg-background text-foreground" key={surface} value={surface}>{surface}</option>
              ))}
              {!surfaces.includes("Other") && (
                <option className="bg-background text-foreground" value="Other">Other</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>
      </div>

      {selectedCategory === "Other" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <Label htmlFor="customCategory">Please specify the category</Label>
          <Input id="customCategory" name="customCategory" defaultValue={defaultCategory && !categories.includes(defaultCategory) ? defaultCategory : ""} required placeholder="e.g. Mixed Media" />
        </div>
      )}

      {selectedMedium === "Other" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <Label htmlFor="customMedium">Please specify the medium</Label>
          <Input id="customMedium" name="customMedium" required placeholder="e.g. Ink" />
        </div>
      )}

      {selectedSurface === "Other" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <Label htmlFor="customSurface">Please specify the surface</Label>
          <Input id="customSurface" name="customSurface" required placeholder="e.g. Fabric, Glass" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferredSize">Preferred Size (Optional)</Label>
          <Input id="preferredSize" name="preferredSize" placeholder="e.g. 24x36 inches, Medium" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Estimated Budget (Optional)</Label>
          <Input id="budget" name="budget" placeholder="e.g. ₹15,000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceLink">Reference Link (Optional)</Label>
        <Input id="referenceLink" name="referenceLink" type="url" placeholder="Link to inspiration or style reference" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setIsImagesExpanded(!isImagesExpanded)}
          className="flex w-full items-center justify-between bg-muted/30 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground" />
            Reference images (optional)
          </span>
          {isImagesExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        
        {isImagesExpanded && (
          <div className="p-4 space-y-4">
            <Label className="text-sm font-medium">Photos (optional)</Label>
            
            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="gap-2 shrink-0 bg-background hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-4" />
                Add Photo
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length}/{CUSTOM_ORDER_IMAGE_LIMITS.maxFiles} selected
              </span>
            </div>
            
            <Input 
              ref={fileInputRef}
              id="reference-images" 
              type="file" 
              accept={CUSTOM_ORDER_IMAGE_LIMITS.allowedTypes.join(",")} 
              multiple 
              onChange={handleFileChange}
              className="hidden"
            />
            
            <p className="text-xs text-muted-foreground">
              Add up to {CUSTOM_ORDER_IMAGE_LIMITS.maxFiles} images. Max 5MB each.
            </p>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 mt-3 border-t border-border">
                {previews.map((preview, index) => (
                  <div key={preview} className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted">
                    <Image 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                    >
                      <X className="size-3" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Project Details</Label>
        <Textarea
          id="message"
          name="message"
          required
          defaultValue={defaultDetails}
          placeholder="Please describe what you have in mind for the commission in as much detail as possible..."
          className="min-h-[150px] resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Submitting Request..."
        ) : (
          <>
            Submit Request
            <Send className="ml-2 size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
