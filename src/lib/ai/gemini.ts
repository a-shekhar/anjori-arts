import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gemini client
export const ai = new GoogleGenAI({});

export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/**
 * Helper to fetch a remote image and convert it to Base64 for Gemini Vision
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<{ base64Image: string; mimeType: string }> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");
  const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

  return { base64Image, mimeType };
}

export interface ArtworkAISuggestions {
  title: string;
  shortDescription: string;
  description: string;
  altText: string;
  tags: string;
}

/**
 * Analyzes an artwork image and generates title, descriptions, alt text, and tags.
 */
export async function analyzeArtworkImage(imageUrl: string): Promise<ArtworkAISuggestions> {
  const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);

  const prompt = `You are an expert SEO and art copywriter for Anjori Arts, an authentic Indian handmade art gallery.
Analyze the provided artwork image and generate SEO-optimized metadata.
Follow these guidelines:
- title: A short, catchy, SEO-friendly title for this artwork (max 60 characters). Do not include quotes.
- shortDescription: A 1-2 sentence description summarizing the artwork.
- description: A detailed, engaging description of the artwork formatted in Markdown. Include imagined details about style, mood, colors, and possible inspiration. Aim for 2-3 paragraphs.
- altText: A highly descriptive, accessible alt text for the image, focusing on visual details for screen readers and Google Image search.
- tags: A comma-separated list of 5-10 relevant keywords (e.g. madhubani, handmade, folk art, natural pigments, indian heritage).`;

  const response = await ai.models.generateContent({
    model: DEFAULT_AI_MODEL,
    contents: [
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          description: { type: Type.STRING },
          altText: { type: Type.STRING },
          tags: { type: Type.STRING },
        },
        required: ["title", "shortDescription", "description", "altText", "tags"],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response received from Gemini AI");
  }

  return safeParseGeminiJson<ArtworkAISuggestions>(responseText, "artwork analysis");
}

/**
 * Safely parses JSON response from Gemini, removing any accidental markdown code fences
 * and providing descriptive error reporting.
 */
function safeParseGeminiJson<T>(responseText: string, context: string): T {
  try {
    // Strip markdown code fences if Gemini returned ```json ... ``` despite application/json mime type
    const sanitized = responseText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(sanitized) as T;
  } catch (err: any) {
    console.error(`[Gemini AI] Failed to parse JSON response for ${context}:`, responseText, err);
    throw new Error(`AI returned an invalid JSON response for ${context}.`);
  }
}

export interface CategoryAISuggestions {
  altText: string;
  description: string;
}

/**
 * Analyzes a category cover image and/or category name to generate rich SEO alt text and a cultural description.
 */
export async function suggestCategoryDetails(params: {
  imageUrl?: string;
  name?: string;
}): Promise<CategoryAISuggestions> {
  const { imageUrl, name } = params;

  const prompt = `You are an expert Indian art historian and SEO copywriter for Anjori Arts.
We need metadata for an art category collection:
${name ? `Category Name: "${name}"` : "Category Name: [Infer from image]"}

Generate two fields:
1. "altText": An accurate, accessible, and SEO-friendly image alt text (70-120 characters) describing the visual subject of the cover image in the context of authentic Indian handcrafted art. Target high-value keywords like 'handmade', 'traditional', and specific motif details (e.g. peacock, Radha Krishna, gold foil, tree of life).
2. "description": A captivating, authoritative 2-sentence cultural summary describing this Indian art tradition, its origins/motifs, and why it holds enduring cultural value for collectors.`;

  const contents: any[] = [prompt];

  if (imageUrl) {
    const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);
    contents.push({ inlineData: { data: base64Image, mimeType } });
  }

  const response = await ai.models.generateContent({
    model: DEFAULT_AI_MODEL,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          altText: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["altText", "description"],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response received from Gemini AI");
  }

  return safeParseGeminiJson<CategoryAISuggestions>(responseText, "category details");
}

export interface TestimonialAISuggestions {
  altText: string;
}

/**
 * Analyzes a collector living space photograph with Gemini Vision to generate an SEO-rich, accessible alt description.
 */
export async function suggestTestimonialAltText(params: {
  imageUrl: string;
  artworkTitle?: string;
  authorName?: string;
  authorLocation?: string;
}): Promise<TestimonialAISuggestions> {
  const { imageUrl, artworkTitle, authorName, authorLocation } = params;
  const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);

  const contextDetails = [
    artworkTitle ? `Artwork Title/Style: "${artworkTitle}"` : null,
    authorName ? `Collector: "${authorName}"` : null,
    authorLocation ? `Location: "${authorLocation}"` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const prompt = `You are an expert SEO and art copywriter for Anjori Arts, an authentic Indian handmade art studio.
Analyze this photograph showing an artwork in a collector's living space or home.
${contextDetails ? `Context: ${contextDetails}` : ""}

Generate an accurate, accessible, and SEO-rich "altText" (under 120 characters) describing the painting and its home setting (e.g. wall, frame, lighting, living room, pooja room, or foyer). Avoid phrases like 'picture of' or 'image of'.
Highlight traditional Indian art motifs and interior context.`;

  const response = await ai.models.generateContent({
    model: DEFAULT_AI_MODEL,
    contents: [
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          altText: { type: Type.STRING },
        },
        required: ["altText"],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response received from Gemini AI");
  }

  return safeParseGeminiJson<TestimonialAISuggestions>(responseText, "testimonial alt text");
}


