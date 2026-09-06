"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { uploadStream } from "@/lib/cloudinary-server";
import {
  testimonialSchema,
  TESTIMONIAL_IMAGE_LIMITS,
} from "@/lib/validations/testimonial";
import type { Testimonial } from "@/types";

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    { db: { schema: "arts" } }
  );
}

export async function submitCustomerTestimonial(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
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
        error: validated.error.issues[0]?.message || "Please check your inputs.",
      };
    }

    // Handle optional room photo
    let imageUrl: string | null = null;
    const imageFile = formData.get("roomPhoto") as File | null;

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      if (imageFile.size > TESTIMONIAL_IMAGE_LIMITS.maxFileSizeBytes) {
        return {
          success: false,
          error: "Uploaded photo is too large (maximum 5MB allowed).",
        };
      }

      if (!TESTIMONIAL_IMAGE_LIMITS.allowedTypes.includes(imageFile.type as any)) {
        return {
          success: false,
          error: "Please upload an image in JPG, PNG, or WebP format.",
        };
      }

      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
        const uploadFolder = `anjori-arts/${envFolder}/testimonials`;
        const result = await uploadStream(buffer, uploadFolder);
        imageUrl = result.secureUrl;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed for testimonial:", uploadErr);
        return {
          success: false,
          error: "Failed to upload photo. Please try again or submit without photo.",
        };
      }
    }

    const defaultAlt = imageUrl
      ? `${validated.data.artworkTitle ? `${validated.data.artworkTitle} in ` : "Artwork in "}${validated.data.authorName.trim()}'s home${validated.data.authorLocation ? `, ${validated.data.authorLocation.trim()}` : ""}`
      : null;

    const supabase = createAdminClient();
    const { error: insertError } = await supabase.from("testimonials").insert({
      author_name: validated.data.authorName.trim(),
      author_location: validated.data.authorLocation?.trim() || null,
      artwork_title: validated.data.artworkTitle?.trim() || null,
      rating: validated.data.rating,
      quote: validated.data.quote.trim(),
      image_url: imageUrl,
      image_alt: defaultAlt,
      is_approved: false, // Moderated by admin
      is_featured: false,
      display_order: 0,
    });

    if (insertError) {
      console.error("Supabase error creating testimonial:", insertError);
      return {
        success: false,
        error: "Unable to save your story at this moment. Please try again later.",
      };
    }

    return {
      success: true,
      message:
        "Thank you! Your story has been received. Once approved by our team, it will appear on our collector wall.",
    };
  } catch (err: any) {
    console.error("Unexpected error in submitCustomerTestimonial:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getPublicTestimonials(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Testimonial[]> {
  try {
    const supabase = getAnonClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error && (error as any).code !== "PGRST205") {
        console.error("Error fetching testimonials:", error.message || error);
      }
      return [];
    }

    return data as Testimonial[];
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return [];
  }
}
