import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { verifyAdminRole } from "@/lib/auth-admin";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await verifyAdminRole();
    if (!authorized) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }


    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ success: false, error: "Failed to fetch image from URL" }, { status: 400 });
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `You are an expert SEO and art copywriter.
Analyze the provided artwork image and generate SEO-optimized metadata.
Follow these guidelines:
- title: A short, catchy, SEO-friendly title for this artwork (max 60 characters). Do not include quotes.
- shortDescription: A 1-2 sentence description summarizing the artwork.
- description: A detailed, engaging description of the artwork formatted in Markdown. Include imagined details about style, mood, colors, and possible inspiration. Aim for 2-3 paragraphs.
- altText: A highly descriptive, accessible alt text for the image, focusing on visual details for screen readers.
- tags: A comma-separated list of 5-10 relevant keywords (e.g. abstract, oil painting, blue, modern).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
            prompt,
            { inlineData: { data: base64Image, mimeType: mimeType } }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    shortDescription: { type: Type.STRING },
                    description: { type: Type.STRING },
                    altText: { type: Type.STRING },
                    tags: { type: Type.STRING }
                },
                required: ["title", "shortDescription", "description", "altText", "tags"]
            }
        }
    });

    const responseText = response.text;
    
    if (!responseText) {
        throw new Error("No response from Gemini");
    }

    const data = JSON.parse(responseText);

    return NextResponse.json({ 
        success: true, 
        data 
    });

  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI suggestions" },
      { status: 500 }
    );
  }
}
