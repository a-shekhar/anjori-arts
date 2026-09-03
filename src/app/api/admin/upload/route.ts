import { NextRequest, NextResponse } from "next/server";
import { uploadStream } from "@/lib/cloudinary-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "anjori-arts/artworks";
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }
    
    // Only allow images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }
    
    // Max size 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large (max 10MB)." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use env-specific folder like other places
    const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const uploadFolder = folder.startsWith("anjori-arts/") 
      ? folder.replace("anjori-arts/", `anjori-arts/${envFolder}/`)
      : `anjori-arts/${envFolder}/${folder}`;

    const result = await uploadStream(buffer, uploadFolder);

    return NextResponse.json({ 
      success: true, 
      url: result.secureUrl,
      publicId: result.publicId
    });
  } catch (error: any) {
    console.error("Image upload API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
