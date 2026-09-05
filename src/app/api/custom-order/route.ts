import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customOrderSchema, CUSTOM_ORDER_IMAGE_LIMITS } from "@/lib/validations/contact";
import { uploadStream } from "@/lib/cloudinary-server";
import { sendNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

// Helper to generate a short human-readable order reference like AA-9K2M
function generateOrderReference() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
  let result = 'CUS-';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
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
    const files = formData.getAll("images") as File[];
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

    // 3. Generate IDs
    const orderId = crypto.randomUUID();
    const orderReference = generateOrderReference();

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

    // 5. Insert into DB with images already included
    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from("custom_orders")
      .insert({
        id: orderId,
        order_reference: orderReference,
        first_name: validated.data.firstName,
        last_name: validated.data.lastName,
        email: validated.data.email,
        country_code: validated.data.countryCode,
        phone: validated.data.phone || null,
        category: validated.data.category,
        medium: validated.data.medium || null,
        surface: validated.data.surface || null,
        preferred_size: validated.data.preferredSize || null,
        budget: validated.data.budget || null,
        reference_link: validated.data.referenceLink || null,
        reference_images: uploadedUrls,
        message: validated.data.message,
      });

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save order to database." }, { status: 500 });
    }

    // 6. Send notification emails
    const emailPayload = {
      ...validated.data,
      artworkType: validated.data.category,
      artworkId: rawData.artworkId,
      referenceImages: uploadedUrls,
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
