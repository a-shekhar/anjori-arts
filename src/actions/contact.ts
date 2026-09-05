"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";
import { sendNotificationEmail } from "@/lib/email";
import crypto from "crypto";

// Helper to generate references (6 alphanumeric characters, cryptographically secure)
function generateReference(prefix: string) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 characters without ambiguous I, O, 1, 0
  let result = prefix + '-';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(crypto.randomInt(0, characters.length));
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

    // 1. Insert into Supabase with collision retry
    const supabase = await createClient();
    let inquiryReference = "";
    let dbError: any = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      inquiryReference = generateReference("INQ");
      const { error } = await supabase.from("inquiries").insert({
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

      if (!error) {
        dbError = null;
        break;
      }

      // If unique constraint violation (Postgres error 23505), retry with a new reference
      if (error.code === "23505") {
        console.warn(`[submitInquiry] Collision on ${inquiryReference}, retrying (attempt ${attempt + 1}/${maxAttempts})...`);
        dbError = error;
        continue;
      }

      dbError = error;
      break;
    }

    if (dbError) {
      console.error("Supabase Error:", dbError.message, dbError.code, dbError.details, dbError.hint);
      return { success: false, error: "Failed to save inquiry to database." };
    }

    // 2. Send email via Resend
    const emailResult = await sendNotificationEmail({ 
      type: "inquiry", 
      data: { ...validated.data, inquiryReference } 
    });
    if (!emailResult.success) {
      console.warn("Inquiry saved, but email failed to send.");
    }

    return { success: true, inquiryReference };
  } catch (err: any) {
    console.error("Submit Inquiry Error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
