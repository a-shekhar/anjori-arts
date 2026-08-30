"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema, customOrderSchema } from "@/lib/validations/contact";
import { sendNotificationEmail } from "@/lib/email";
import crypto from "crypto";

// Helper to generate references
function generateReference(prefix: string) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = prefix + '-';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function submitInquiry(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      countryCode: formData.get("countryCode"),
      phone: formData.get("phone"),
      category: formData.get("category"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validated = contactSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Please check your inputs." };
    }

    // 1. Insert into Supabase
    const supabase = await createClient();
    const inquiryReference = generateReference("INQ");
    const { error: dbError } = await supabase.from("inquiries").insert({
      inquiry_reference: inquiryReference,
      first_name: validated.data.firstName,
      last_name: validated.data.lastName,
      email: validated.data.email,
      country_code: validated.data.countryCode,
      phone: validated.data.phone || null,
      category: validated.data.category,
      subject: validated.data.subject,
      message: validated.data.message,
    });

    if (dbError) {
      console.error("Supabase Error:", dbError.message, dbError.code, dbError.details, dbError.hint);
      return { success: false, error: "Failed to save inquiry to database." };
    }

    // 2. Send email via Resend
    const emailResult = await sendNotificationEmail({ type: "inquiry", data: validated.data });
    if (!emailResult.success) {
      console.warn("Inquiry saved, but email failed to send.");
    }

    return { success: true };
  } catch (err: any) {
    console.error("Submit Inquiry Error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}


