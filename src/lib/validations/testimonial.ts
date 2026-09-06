import { z } from "zod";

export const testimonialSchema = z.object({
  authorName: z
    .string()
    .min(2, "Please enter your name (at least 2 characters)")
    .max(100, "Name must be less than 100 characters"),
  authorLocation: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  artworkTitle: z
    .string()
    .max(150, "Artwork title must be less than 150 characters")
    .optional()
    .or(z.literal("")),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Please provide a rating between 1 and 5 stars")
    .max(5, "Rating cannot exceed 5 stars"),
  quote: z
    .string()
    .min(10, "Please share a few more thoughts (at least 10 characters)")
    .max(2000, "Story must be under 2,000 characters"),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

export const TESTIMONIAL_IMAGE_LIMITS = {
  maxFiles: 1,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

