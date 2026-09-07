import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters long").max(5000),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const customOrderSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string().default("+91"),
  phone: z.string().optional(),
  category: z.string().optional().or(z.literal("")),
  medium: z.string().optional(),
  surface: z.string().optional(),
  preferredSize: z.string().optional(),
  budget: z.string().optional(),
  referenceLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;

export const CUSTOM_ORDER_IMAGE_LIMITS = {
  maxFiles: 5,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
