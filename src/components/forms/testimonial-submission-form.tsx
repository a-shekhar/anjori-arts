"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Upload, X, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitCustomerTestimonial } from "@/actions/testimonials";
import { TESTIMONIAL_IMAGE_LIMITS } from "@/lib/validations/testimonial";

export function TestimonialSubmissionForm() {
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [submittedName, setSubmittedName] = React.useState<string>("");

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Clean up object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > TESTIMONIAL_IMAGE_LIMITS.maxFileSizeBytes) {
      toast.error("Image file size must be 5MB or smaller.");
      return;
    }

    if (!TESTIMONIAL_IMAGE_LIMITS.allowedTypes.includes(file.type as any)) {
      toast.error("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("rating", rating.toString());

      if (selectedFile) {
        formData.set("roomPhoto", selectedFile);
      }

      const name = (formData.get("authorName") as string) || "Collector";
      const result = await submitCustomerTestimonial(formData);

      if (!result.success) {
        toast.error(result.error || "Unable to submit your story. Please try again.");
        return;
      }

      setSubmittedName(name);
      setIsSuccess(true);
      toast.success("Thank you for sharing your collector story!");
    } catch (err: any) {
      console.error("Testimonial submission error:", err);
      toast.error("Something went wrong. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-[2rem] border border-border bg-card p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <p className="aa-eyebrow mt-6">Story Received</p>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-foreground">
          Thank you, {submittedName}!
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your feedback and photograph mean the world to our artists. Once verified by our studio team, your piece will take its place on our Collector Stories wall.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/stories"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-6")}
          >
            View Collector Stories
          </Link>
          <Link
            href="/shop"
            className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6")}
          >
            Explore the Collection <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-card p-6 sm:p-10 shadow-sm">
      <div className="space-y-8">
        {/* Rating Selection */}
        <div>
          <Label className="block text-sm font-medium text-foreground">
            Overall Experience / Rating <span className="text-destructive">*</span>
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            How was the artwork, craftsmanship, and delivery?
          </p>
          <div className="mt-3 flex items-center gap-1.5" role="radiogroup" aria-label="Rating selection">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = (hoverRating ?? rating) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  role="radio"
                  aria-checked={rating === starValue}
                  aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(starValue)}
                  className="flex size-11 items-center justify-center rounded-xl border border-transparent transition-all hover:scale-105 hover:bg-muted/80 focus-visible:border-primary focus-visible:outline-none"
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      active
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40 hover:text-muted-foreground"
                    )}
                  />
                </button>
              );
            })}
            <span className="ml-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {rating === 5 && "Flawless & Exquisite"}
              {rating === 4 && "Great Experience"}
              {rating === 3 && "Satisfactory"}
              {rating === 2 && "Could be better"}
              {rating === 1 && "Needs attention"}
            </span>
          </div>
        </div>

        {/* Name & Location Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="authorName" className="text-sm font-medium">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="authorName"
              name="authorName"
              required
              placeholder="e.g. Radhika & Arun M."
              className="h-11 rounded-xl"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorLocation" className="text-sm font-medium">
              City / State / Country <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="authorLocation"
              name="authorLocation"
              placeholder="e.g. Mumbai, Maharashtra"
              className="h-11 rounded-xl"
              maxLength={100}
            />
          </div>
        </div>

        {/* Artwork / Commission Name */}
        <div className="space-y-2">
          <Label htmlFor="artworkTitle" className="text-sm font-medium">
            Artwork or Commission Style <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="artworkTitle"
            name="artworkTitle"
            placeholder="e.g. Pichwai Kamdhenu (36×24 in) or Custom Madhubani"
            className="h-11 rounded-xl"
            maxLength={150}
          />
        </div>

        {/* Collector Story / Feedback */}
        <div className="space-y-2">
          <Label htmlFor="quote" className="text-sm font-medium">
            Your Thoughts & Story <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Share your feelings on the artwork, the detailing, how it complements your room, or how it was packed and handled.
          </p>
          <Textarea
            id="quote"
            name="quote"
            required
            rows={5}
            minLength={10}
            maxLength={2000}
            placeholder="The painting arrived in pristine custom framing. The natural pigments shine beautifully in natural morning light..."
            className="rounded-xl resize-y"
          />
        </div>

        {/* Room / Wall Photo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Photo of the Artwork in Your Space <span className="text-xs text-muted-foreground">(Optional, max 5MB)</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            We love seeing how our paintings find a place in your home, living room, pooja space, or study.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
            id="room-photo-input"
          />

          {!previewUrl ? (
            <label
              htmlFor="room-photo-input"
              className="group flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-colors hover:border-primary/60 hover:bg-muted/40"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                <Upload className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Click or tap to upload a room photograph
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, or WebP up to 5MB
              </p>
            </label>
          ) : (
            <div className="relative inline-block overflow-hidden rounded-2xl border border-border bg-secondary">
              <div className="relative h-48 w-72 sm:h-56 sm:w-80">
                <Image
                  src={previewUrl}
                  alt="Preview of painting in room"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Remove uploaded photo"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-xs transition-colors hover:bg-destructive hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto h-12 rounded-full px-8 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sharing your story...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Submit Collector Story
              </>
            )}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            To safeguard our community from spam, submissions are reviewed by our studio before appearing publicly on the collector wall.
          </p>
        </div>
      </div>
    </form>
  );
}

