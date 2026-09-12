import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  countryCode: z.string().default("+91"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const userAddressSchema = z.object({
  recipient_name: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters")
    .max(100, "Recipient name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  street: z
    .string()
    .trim()
    .min(5, "Flat/House no. and street address is required")
    .max(255, "Street address is too long"),
  landmark: z
    .string()
    .trim()
    .max(100, "Landmark is too long")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "City name is too long"),
  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100, "State name is too long"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  address_type: z.enum(["home", "work", "other"]).default("home"),
  is_default: z.boolean().default(false),
});

export type UserAddressFormData = z.infer<typeof userAddressSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

