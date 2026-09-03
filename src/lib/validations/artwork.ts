import { z } from "zod";

export const artworkVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().nullable().optional(),
  label: z.string().min(1, "Label is required"),
  widthInches: z.number().min(0, "Width must be positive"),
  heightInches: z.number().min(0, "Height must be positive"),
  mrp: z.number().min(0, "MRP must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stockQuantity: z.number().int().min(-1, "Stock quantity must be >= -1 (-1 for made-to-order)"),
  isActive: z.boolean().default(true),
  canBeFramed: z.boolean().default(false),
  framingPrice: z.number().optional().default(0),
});

export const artworkImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().optional(),
  publicId: z.string().optional(),
});

export const artworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  surfaceId: z.string().nullable().optional(),
  mediumIds: z.array(z.string()).default([]),
  price: z.number().optional().default(0), // In Rupees, derived from first variant
  dimensions: z.string().optional().default(""), // Derived from first variant
  shortDescription: z.string().nullable().optional(),
  description: z.string().min(1, "Description is required"),
  artistNote: z.string().nullable().optional(),
  tags: z.string().nullable().optional(), // Comma-separated string in UI, converted to array in DB
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(artworkImageSchema).min(1, "At least one image is required"),
  variants: z.array(artworkVariantSchema).min(1, "At least one variant (e.g., base size/frame) is required"),
});

export type ArtworkFormValues = z.infer<typeof artworkSchema>;
export type ArtworkVariantValues = z.infer<typeof artworkVariantSchema>;
