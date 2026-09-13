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
  artistNote: string;
  altText: string;
  tags: string;
}

export interface AnalyzeArtworkParams {
  imageUrl: string;
  title?: string;
  category?: string;
  surface?: string;
  mediums?: string[];
  artistNote?: string;
}

/**
 * Analyzes an artwork image with contextual hints (title, category, surface, mediums, artist's note)
 * and generates title, descriptions, artist note, alt text, and SEO tags.
 */
export async function analyzeArtworkImage(input: string | AnalyzeArtworkParams): Promise<ArtworkAISuggestions> {
  const params: AnalyzeArtworkParams = typeof input === "string" ? { imageUrl: input } : input;
  const { imageUrl, title, category, surface, mediums, artistNote } = params;

  const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);

  // Build contextual hints block
  const contextHints: string[] = [];
  if (title?.trim()) {
    contextHints.push(`- Working Title / Subject Draft: "${title.trim()}"`);
  }
  if (category?.trim()) {
    contextHints.push(`- Art Category / Tradition: "${category.trim()}"`);
  }
  if (surface?.trim()) {
    contextHints.push(`- Canvas / Surface Material: "${surface.trim()}"`);
  }
  if (mediums && mediums.length > 0) {
    contextHints.push(`- Mediums / Colors Used: "${mediums.join(", ")}"`);
  }
  if (artistNote?.trim()) {
    contextHints.push(`- Artist's Draft Note / Sentiment: "${artistNote.trim()}"`);
  }

  const contextSection = contextHints.length > 0
    ? `\n\nKnown Artwork Details (use to guide and ground your response):\n${contextHints.join("\n")}`
    : "";

  const prompt = `You are an expert SEO art curator and copywriter for Anjori Arts, an authentic Indian handmade art gallery.
Analyze the provided artwork image alongside any known details to generate rich, culturally authentic, and SEO-optimized metadata.${contextSection}

Follow these strict guidelines:
- title: A compelling, collector-grade fine art title (max 60 characters). Do not include quotes.
  * If a working title was provided: If it is brief, generic, or a working draft (e.g. "Dogs", "Fish", "Flower"), elevate and expand it into an evocative fine art title that honors the subject and art tradition (e.g., "Loyal Spirits: Contemporary Indian Folk Dogs Painting"). If it is already poetic and specific, polish and optimize it for search while keeping the artist's exact concept.
  * If no working title was provided: Create a brand new evocative title based on the visual subject, category, and materials.
- shortDescription: A 1-2 sentence compelling summary of the artwork, touching upon the subject, mood, and art tradition.
- description: A detailed, captivating story of the artwork formatted in Markdown (2-3 paragraphs). Accurately incorporate the specified surface (e.g., handmade paper, canvas) and mediums (e.g., natural pigments, acrylic, gold foil) to describe the textural feel, traditional techniques, mood, and cultural significance.
- artistNote: An intimate, personal reflection in the artist's first-person voice (1-3 sentences).
  * If an artist's draft note was provided, refine and elevate its language into a poetic, authentic artist reflection while preserving the genuine emotion.
  * If none was provided, craft a heartfelt reflection connecting the artist's personal inspiration, meditative process, and connection to the materials.
- altText: Highly descriptive, accessible visual alt text (under 125 characters) detailing visual subjects, colors, and surface texture for screen readers and Google Image search.
- tags: A comma-separated list of 6-10 high-value keywords covering the subject, tradition (e.g. madhubani, mandala, pichwai), exact surface and mediums, and heritage terms (e.g. handmade, indian folk art, traditional art).`;

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
          artistNote: { type: Type.STRING },
          altText: { type: Type.STRING },
          tags: { type: Type.STRING },
        },
        required: ["title", "shortDescription", "description", "artistNote", "altText", "tags"],
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


