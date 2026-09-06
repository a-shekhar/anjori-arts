"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import { uploadStream, deleteAsset } from "@/lib/cloudinary-server";
import {
  testimonialSchema,
  TESTIMONIAL_IMAGE_LIMITS,
} from "@/lib/validations/testimonial";
import type { Testimonial } from "@/types";

/**
 * Fetch all testimonials for admin management (includes both approved and pending).
 */
export const getAdminTestimonials = withAdminAuth(
  async (): Promise<Testimonial[]> => {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("is_approved", { ascending: true }) // unapproved (pending) first
        .order("created_at", { ascending: false });

      if (error || !data) {
        if (error?.code === "PGRST205" || error?.message?.includes("Could not find the table") || error?.message?.includes("does not exist")) {
          // Table has not been created yet in Supabase. Return empty list quietly without triggering dev error overlay.
          return [];
        }
        const errorMsg = error?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
        console.error("Error fetching admin testimonials:", errorMsg);
        return [];
      }

      return data as Testimonial[];
    } catch (err) {
      console.error("[getAdminTestimonials] Unexpected error:", err);
      return [];
    }
  },
  { fallback: [] }
);

/**
 * Toggle testimonial approval (publish / unpublish).
 */
export const toggleTestimonialApproval = withAdminAuth(
  async (id: string, isApproved: boolean) => {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Error toggling testimonial approval:", error);
        return { success: false, error: "Failed to update approval status." };
      }

      revalidatePath("/");
      revalidatePath("/stories");
      revalidatePath("/admin/testimonials");
      return { success: true };
    } catch (err: any) {
      console.error("[toggleTestimonialApproval] Error:", err);
      return { success: false, error: err?.message || "Unexpected error." };
    }
  }
);

/**
 * Toggle featured status on homepage.
 */
export const toggleTestimonialFeatured = withAdminAuth(
  async (id: string, isFeatured: boolean) => {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Error toggling testimonial featured:", error);
        return { success: false, error: "Failed to update featured status." };
      }

      revalidatePath("/");
      revalidatePath("/stories");
      revalidatePath("/admin/testimonials");
      return { success: true };
    } catch (err: any) {
      console.error("[toggleTestimonialFeatured] Error:", err);
      return { success: false, error: err?.message || "Unexpected error." };
    }
  }
);

/**
 * Create a new testimonial directly from the Admin Panel (e.g. from WhatsApp/Instagram).
 */
export const createAdminTestimonial = withAdminAuth(
  async (formData: FormData) => {
    try {
      const rawData = {
        authorName: formData.get("authorName"),
        authorLocation: formData.get("authorLocation"),
        artworkTitle: formData.get("artworkTitle"),
        rating: formData.get("rating"),
        quote: formData.get("quote"),
      };

      const validated = testimonialSchema.safeParse(rawData);
      if (!validated.success) {
        return {
          success: false,
          error: validated.error.issues[0]?.message || "Invalid input.",
        };
      }

      const isApproved = formData.get("isApproved") === "true";
      const isFeatured = formData.get("isFeatured") === "true";
      const customImageAlt = (formData.get("imageAlt") as string)?.trim() || null;

      // Handle optional image file
      let imageUrl: string | null = null;
      const imageFile = formData.get("imageFile") as File | null;

      if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
        if (imageFile.size > TESTIMONIAL_IMAGE_LIMITS.maxFileSizeBytes) {
          return { success: false, error: "Uploaded image exceeds 5MB limit." };
        }
        if (!TESTIMONIAL_IMAGE_LIMITS.allowedTypes.includes(imageFile.type as any)) {
          return { success: false, error: "Image must be JPG, PNG, or WebP." };
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
        const uploadFolder = `anjori-arts/${envFolder}/testimonials`;
        const result = await uploadStream(buffer, uploadFolder);
        imageUrl = result.secureUrl;
      }

      const supabase = createAdminClient();
      const defaultAlt = imageUrl
        ? `${validated.data.artworkTitle ? `${validated.data.artworkTitle} in ` : "Artwork in "}${validated.data.authorName.trim()}'s home${validated.data.authorLocation ? `, ${validated.data.authorLocation.trim()}` : ""}`
        : null;

      const { error } = await supabase.from("testimonials").insert({
        author_name: validated.data.authorName.trim(),
        author_location: validated.data.authorLocation?.trim() || null,
        artwork_title: validated.data.artworkTitle?.trim() || null,
        rating: validated.data.rating,
        quote: validated.data.quote.trim(),
        image_url: imageUrl,
        image_alt: customImageAlt || defaultAlt,
        is_approved: isApproved,
        is_featured: isFeatured,
        display_order: 0,
      });

      if (error) {
        console.error("Error creating testimonial in DB:", error);
        return { success: false, error: "Database error creating testimonial." };
      }

      revalidatePath("/");
      revalidatePath("/stories");
      revalidatePath("/admin/testimonials");
      return { success: true };
    } catch (err: any) {
      console.error("[createAdminTestimonial] Error:", err);
      return { success: false, error: err?.message || "Unexpected error." };
    }
  }
);

/**
 * Update an existing testimonial (edit text, name, location, rating, or upload new photo).
 */
export const updateAdminTestimonial = withAdminAuth(
  async (id: string, formData: FormData) => {
    try {
      const rawData = {
        authorName: formData.get("authorName"),
        authorLocation: formData.get("authorLocation"),
        artworkTitle: formData.get("artworkTitle"),
        rating: formData.get("rating"),
        quote: formData.get("quote"),
      };

      const validated = testimonialSchema.safeParse(rawData);
      if (!validated.success) {
        return {
          success: false,
          error: validated.error.issues[0]?.message || "Invalid input.",
        };
      }

      const isApproved = formData.get("isApproved") === "true";
      const isFeatured = formData.get("isFeatured") === "true";
      const customImageAlt = (formData.get("imageAlt") as string)?.trim() || null;
      const existingImageUrl = (formData.get("existingImageUrl") as string) || null;

      let imageUrl: string | null = existingImageUrl;
      const imageFile = formData.get("imageFile") as File | null;

      if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
        if (imageFile.size > TESTIMONIAL_IMAGE_LIMITS.maxFileSizeBytes) {
          return { success: false, error: "Uploaded image exceeds 5MB limit." };
        }
        if (!TESTIMONIAL_IMAGE_LIMITS.allowedTypes.includes(imageFile.type as any)) {
          return { success: false, error: "Image must be JPG, PNG, or WebP." };
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
        const uploadFolder = `anjori-arts/${envFolder}/testimonials`;
        const result = await uploadStream(buffer, uploadFolder);
        imageUrl = result.secureUrl;
      }

      const defaultAlt = imageUrl
        ? `${validated.data.artworkTitle ? `${validated.data.artworkTitle} in ` : "Artwork in "}${validated.data.authorName.trim()}'s home${validated.data.authorLocation ? `, ${validated.data.authorLocation.trim()}` : ""}`
        : null;

      const supabase = createAdminClient();
      const { error } = await supabase
        .from("testimonials")
        .update({
          author_name: validated.data.authorName.trim(),
          author_location: validated.data.authorLocation?.trim() || null,
          artwork_title: validated.data.artworkTitle?.trim() || null,
          rating: validated.data.rating,
          quote: validated.data.quote.trim(),
          image_url: imageUrl,
          image_alt: customImageAlt || defaultAlt,
          is_approved: isApproved,
          is_featured: isFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating testimonial:", error);
        return { success: false, error: "Database error updating testimonial." };
      }

      revalidatePath("/");
      revalidatePath("/stories");
      revalidatePath("/admin/testimonials");
      return { success: true };
    } catch (err: any) {
      console.error("[updateAdminTestimonial] Error:", err);
      return { success: false, error: err?.message || "Unexpected error." };
    }
  }
);

/**
 * Permanently delete a testimonial.
 */
export const deleteAdminTestimonial = withAdminAuth(
  async (id: string) => {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting testimonial:", error);
        return { success: false, error: "Failed to delete testimonial." };
      }

      revalidatePath("/");
      revalidatePath("/stories");
      revalidatePath("/admin/testimonials");
      return { success: true };
    } catch (err: any) {
      console.error("[deleteAdminTestimonial] Error:", err);
      return { success: false, error: err?.message || "Unexpected error." };
    }
  }
);

