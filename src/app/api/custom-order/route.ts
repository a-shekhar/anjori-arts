import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customOrderSchema, CUSTOM_ORDER_IMAGE_LIMITS } from "@/lib/validations/contact";
import { uploadStream } from "@/lib/cloudinary-server";
import { sendNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import { customOrderRateLimiter, checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { generateReferenceCode } from "@/lib/reference";
import crypto from "crypto";

// Helper to generate a standardized human-readable order reference like CUS-2026-9K2MPX
function generateOrderReference() {
  return generateReferenceCode("CUS");
}

export async function POST(req: NextRequest) {
  try {
    // 0. Check rate limit before parsing multipart files or uploading to Cloudinary
    const clientIp = getClientIp(req.headers);
    const rateLimit = await checkRateLimit(customOrderRateLimiter, clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many custom order requests from your device. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    
    // 1. Extract text fields
    const getTrimmed = (field: string) => {
      const val = formData.get(field);
      return typeof val === "string" ? val.trim() || undefined : undefined;
    };

    const rawData = {
      artworkId: (formData.get("artworkId") as string) || null,
      firstName: (formData.get("firstName") as string)?.trim() || "",
      lastName: (formData.get("lastName") as string)?.trim() || "",
      email: (formData.get("email") as string)?.trim() || "",
      countryCode: (formData.get("countryCode") as string)?.trim() || "+91",
      phone: getTrimmed("phone"),
      category: (formData.get("category") as string)?.trim() || "",
      medium: getTrimmed("medium"),
      surface: getTrimmed("surface"),
      preferredSize: getTrimmed("preferredSize"),
      budget: getTrimmed("budget"),
      referenceLink: getTrimmed("referenceLink"),
      message: (formData.get("message") as string)?.trim() || "",
    };

    const validated = customOrderSchema.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0]?.message || "Invalid input." }, { status: 400 });
    }

    // 2. Extract and validate files
    const files = (formData.getAll("images") as File[]).filter(
      (f) => f && typeof f === "object" && "size" in f && f.size > 0
    );

    // Option A validation: Require at least some project context
    const hasMessage = Boolean(rawData.message && rawData.message.trim().length > 0);
    const hasImages = files.length > 0;
    const hasRefLink = Boolean(rawData.referenceLink && rawData.referenceLink.trim().length > 0);

    if (!hasMessage && !hasImages && !hasRefLink) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide project details, upload reference photos, or share an inspiration link.",
        },
        { status: 400 }
      );
    }

    if (files.length > CUSTOM_ORDER_IMAGE_LIMITS.maxFiles) {
      return NextResponse.json({ success: false, error: `Maximum ${CUSTOM_ORDER_IMAGE_LIMITS.maxFiles} images allowed.` }, { status: 400 });
    }

    for (const file of files) {
      if (!CUSTOM_ORDER_IMAGE_LIMITS.allowedTypes.includes(file.type as typeof CUSTOM_ORDER_IMAGE_LIMITS.allowedTypes[number])) {
        return NextResponse.json({ success: false, error: `Invalid file type: ${file.name}` }, { status: 400 });
      }
      if (file.size > CUSTOM_ORDER_IMAGE_LIMITS.maxFileSizeBytes) {
        return NextResponse.json({ success: false, error: `File too large (max 5MB): ${file.name}` }, { status: 400 });
      }
    }

    // 3. Generate ID
    const orderId = crypto.randomUUID();

    // 4. Upload images to Cloudinary
    const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const uploadFolder = `anjori-arts/${envFolder}/custom-orders/${orderId}`;
    
    const uploadedUrls: string[] = [];

    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await uploadStream(buffer, uploadFolder);
        return result.secureUrl;
      });

      try {
        const results = await Promise.all(uploadPromises);
        uploadedUrls.push(...results);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return NextResponse.json({ success: false, error: "Failed to upload reference images." }, { status: 500 });
      }
    }

    // 5. Insert into DB with images already included (with retry on collision)
    const supabase = createAdminClient();
    let orderReference = "";
    let dbError: { code?: string; message?: string } | null = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      orderReference = generateOrderReference();
      const { error } = await supabase
        .from("custom_orders")
        .insert({
          id: orderId,
          order_reference: orderReference,
          first_name: validated.data.firstName,
          last_name: validated.data.lastName,
          email: validated.data.email,
          country_code: validated.data.countryCode,
          phone: validated.data.phone || null,
          category: validated.data.category || "Not specified",
          medium: validated.data.medium || null,
          surface: validated.data.surface || null,
          preferred_size: validated.data.preferredSize || null,
          budget: validated.data.budget || null,
          reference_link: validated.data.referenceLink || null,
          reference_images: uploadedUrls,
          message: validated.data.message || "",
        });

      if (!error) {
        dbError = null;
        break;
      }

      // If unique constraint violation on order_reference (Postgres error 23505), retry with a new reference
      if (error.code === "23505") {
        console.warn(`[custom-order] Collision on ${orderReference}, retrying (attempt ${attempt + 1}/${maxAttempts})...`);
        dbError = error;
        continue;
      }

      dbError = error;
      break;
    }

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save order to database." }, { status: 500 });
    }

    // 6. Send notification emails
    const emailPayload = {
      ...validated.data,
      category: validated.data.category || "Not specified",
      artworkType: validated.data.category || "Custom",
      artworkId: rawData.artworkId,
      referenceImages: uploadedUrls,
      message: validated.data.message || "",
      orderReference,
    };

    // Send Admin Notification (don't block on customer confirmation if admin sends, but try both concurrently)
    await Promise.allSettled([
      sendNotificationEmail({ type: "custom_order", data: emailPayload }),
      sendCustomerConfirmationEmail(emailPayload)
    ]);

    return NextResponse.json({ success: true, orderId, orderReference });
  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
