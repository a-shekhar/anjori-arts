import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRole } from "@/lib/auth-admin";
import { analyzeArtworkImage, suggestCategoryDetails, suggestTestimonialAltText } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await verifyAdminRole();
    if (!authorized) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const mode = body?.mode || body?.type || "artwork";

    if (mode === "testimonial") {
      const { imageUrl, artworkTitle, authorName, authorLocation } = body;
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: "Image URL is required for testimonial alt text analysis" },
          { status: 400 }
        );
      }

      const data = await suggestTestimonialAltText({
        imageUrl,
        artworkTitle,
        authorName,
        authorLocation,
      });
      return NextResponse.json({ success: true, data });
    }

    if (mode === "category") {
      const { imageUrl, name } = body;
      if (!imageUrl && !name) {
        return NextResponse.json(
          { success: false, error: "Either an image URL or category name is required" },
          { status: 400 }
        );
      }

      const data = await suggestCategoryDetails({ imageUrl, name });
      return NextResponse.json({ success: true, data });
    }

    // Default: Artwork analysis
    const { imageUrl } = body;
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
    }

    const data = await analyzeArtworkImage(imageUrl);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Gemini AI Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI suggestions" },
      { status: 500 }
    );
  }
}
