import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  customerEmail: z
    .string()
    .email("Please enter a valid email address for order confirmation"),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  countryCode: z.string().default("+91"),
  street: z
    .string()
    .min(5, "Please enter your full street address / flat / building name")
    .max(250, "Address is too long"),
  landmark: z.string().max(100, "Landmark too long").optional().or(z.literal("")),
  city: z
    .string()
    .min(2, "City name is required")
    .max(100),
  state: z
    .string()
    .min(2, "State name is required")
    .max(100),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
  deliveryInstructions: z
    .string()
    .max(500, "Instructions cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  paymentMethod: z.enum(
    ["upi_qr", "bank_transfer", "pay_on_dispatch", "razorpay"],
    {
      message: "Please select a valid payment method",
    }
  ),
  paymentReference: z.string().optional().or(z.literal("")),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
