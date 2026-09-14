"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePostgrestIdentifier } from "@/lib/supabase/sanitize";
import { artworkSchema } from "@/lib/validations/artwork";
import { revalidatePath } from "next/cache";
import { deleteArtworkFolder, deleteAsset } from "@/lib/cloudinary-server";
import { withAdminAuth } from "@/lib/auth-admin";

export const getAdminArtworks = withAdminAuth(async () => {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from("artworks")
      .select(`
        *,
        category:categories(name),
        variants:artwork_variants(id)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin artworks:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("[getAdminArtworks] Unexpected error:", err);
    return [];
  }
}, { fallback: [] });

export const getArtworkFormTaxonomies = withAdminAuth(async () => {
  try {
    const supabase = createAdminClient();

    const [initialCategoriesRes, surfacesRes, mediumsRes] = await Promise.all([
      supabase.from("categories").select("id, name, slug").order("display_order", { ascending: true }).order("name"),
      supabase.from("surfaces").select("id, name, slug").eq("is_active", true).order("display_order"),
      supabase.from("mediums").select("id, name, slug").order("name", { ascending: true }),
    ]);

    let categoriesRes = initialCategoriesRes;

    if (categoriesRes.error && categoriesRes.error.code === "42703") {
      categoriesRes = await supabase.from("categories").select("id, name, slug").order("name");
    }

    return {
      categories: categoriesRes.data || [],
      surfaces: surfacesRes.data || [],
      mediums: mediumsRes.data || [],
    };
  } catch (err) {
    console.error("[getArtworkFormTaxonomies] Unexpected error:", err);
    return { categories: [], surfaces: [], mediums: [] };
  }
}, { fallback: { categories: [], surfaces: [], mediums: [] } });

export const getAdminArtworkById = withAdminAuth(async (id: string) => {
  try {
    const cleanId = sanitizePostgrestIdentifier(id);
    if (!cleanId) {
      return null;
    }

    const supabase = createAdminClient();
    const isArtId = cleanId.startsWith("art-");

    let query = supabase
      .from("artworks")
      .select(`
        *,
        artwork_mediums(medium_id),
        variants:artwork_variants(*)
      `);

    if (isArtId) {
      query = query.eq("id", cleanId);
    } else {
      query = query.or(`id.eq.${cleanId},slug.eq.${cleanId}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    // Transform data for the form
    return {
      ...data,
      slug: data.slug ?? "",
      categoryId: data.category_id,
      surfaceId: data.surface_id,
      shortDescription: data.short_description ?? "",
      artistNote: data.artist_note ?? "",
      isAvailable: data.is_available,
      isFeatured: data.is_featured,
      price: data.price / 100, // convert paise to rupees
      tags: (data.tags || []).join(", "),
      mediumIds: (data.artwork_mediums || []).map((am: { medium_id: string }) => am.medium_id),
      variants: (data.variants || []).map((v: Record<string, unknown>) => ({
        ...v,
        sku: (v.sku as string) ?? "",
        mrp: (v.mrp as number) / 100,
        sellingPrice: (v.selling_price as number) / 100,
        widthInches: v.width_inches as number,
        heightInches: v.height_inches as number,
        stockQuantity: v.stock_quantity as number,
        isActive: v.is_active as boolean,
        canBeFramed: (v.can_be_framed as boolean) || false,
        framingPrice: v.framing_price ? (v.framing_price as number) / 100 : 0,
      })),
    };
  } catch (err) {
    console.error("[getAdminArtworkById] Unexpected error:", err);
    return null;
  }
}, { fallback: null });

export const createArtwork = withAdminAuth(async (prevState: unknown, formData: FormData) => {
  try {
    const supabase = createAdminClient();

    const payloadStr = formData.get("payload") as string;
    if (!payloadStr) return { success: false, message: "Missing payload" };
    
    let rawData: unknown;
    try {
      rawData = JSON.parse(payloadStr);
    } catch {
      return { success: false, message: "Invalid payload format: malformed JSON" };
    }
    
    const validatedFields = artworkSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { success: false, message: "Validation failed", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { mediumIds, variants, tags, ...baseData } = validatedFields.data;
    
    const tagsArray = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const artworkId = validatedFields.data.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const firstVariant = variants[0];
    const authoritativePrice = firstVariant ? Math.round(firstVariant.sellingPrice * 100) : Math.round(baseData.price * 100);
    const authoritativeDimensions = firstVariant && firstVariant.widthInches > 0 && firstVariant.heightInches > 0
      ? `${firstVariant.widthInches}" × ${firstVariant.heightInches}"`
      : (baseData.dimensions && !/^0(?:\.0+)?["']?\s*[×x*]\s*0(?:\.0+)?["']?$/i.test(baseData.dimensions.trim()) ? baseData.dimensions : null);

    // 1. Insert base artwork
    const { error: artworkError } = await supabase
      .from("artworks")
      .insert({
        id: artworkId,
        title: baseData.title,
        slug: baseData.slug,
        category_id: baseData.categoryId,
        surface_id: baseData.surfaceId || null,
        price: authoritativePrice, // authoritatively calculated in paise
        dimensions: authoritativeDimensions,
        short_description: baseData.shortDescription,
        description: baseData.description,
        artist_note: baseData.artistNote,
        tags: tagsArray,
        is_available: baseData.isAvailable,
        is_featured: baseData.isFeatured,
        images: baseData.images,
      });

    if (artworkError) {
      return { success: false, message: artworkError.message };
    }

    // 2. Insert mediums
    if (mediumIds.length > 0) {
      const mediumInserts = mediumIds.map(mid => ({ artwork_id: artworkId, medium_id: mid }));
      await supabase.from("artwork_mediums").insert(mediumInserts);
    }

    // 3. Insert variants
    if (variants.length > 0) {
      const variantInserts = variants.map(v => ({
        id: crypto.randomUUID(),
        artwork_id: artworkId,
        label: v.label,
        width_inches: v.widthInches,
        height_inches: v.heightInches,
        mrp: Math.round(v.mrp * 100),
        selling_price: Math.round(v.sellingPrice * 100),
        stock_quantity: v.stockQuantity,
        is_active: v.isActive,
        can_be_framed: v.canBeFramed,
        framing_price: v.framingPrice ? Math.round(v.framingPrice * 100) : 0,
        sku: v.sku || null,
      }));
      const { error: variantInsertError } = await supabase.from("artwork_variants").insert(variantInserts);
      if (variantInsertError) {
        console.error("Variant Insert Error:", variantInsertError);
        return { success: false, message: `Failed to insert variants: ${variantInsertError.message}` };
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/artworks");
    return { success: true, artworkId };
  } catch (err: unknown) {
    console.error("[createArtwork] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while creating the artwork." };
  }
});

export const updateArtwork = withAdminAuth(async (id: string, prevState: unknown, formData: FormData) => {
  try {
    const supabase = createAdminClient();

    const payloadStr = formData.get("payload") as string;
    if (!payloadStr) return { success: false, message: "Missing payload" };
    
    let rawData: unknown;
    try {
      rawData = JSON.parse(payloadStr);
    } catch {
      return { success: false, message: "Invalid payload format: malformed JSON" };
    }
    
    const validatedFields = artworkSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { success: false, message: "Validation failed", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { mediumIds, variants, tags, ...baseData } = validatedFields.data;
    const tagsArray = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    const firstVariant = variants[0];
    const authoritativePrice = firstVariant ? Math.round(firstVariant.sellingPrice * 100) : Math.round(baseData.price * 100);
    const authoritativeDimensions = firstVariant && firstVariant.widthInches > 0 && firstVariant.heightInches > 0
      ? `${firstVariant.widthInches}" × ${firstVariant.heightInches}"`
      : (baseData.dimensions && !/^0(?:\.0+)?["']?\s*[×x*]\s*0(?:\.0+)?["']?$/i.test(baseData.dimensions.trim()) ? baseData.dimensions : null);

    // 1. Update base artwork
    const { error: artworkError } = await supabase
      .from("artworks")
      .update({
        title: baseData.title,
        slug: baseData.slug,
        category_id: baseData.categoryId,
        surface_id: baseData.surfaceId || null,
        price: authoritativePrice,
        dimensions: authoritativeDimensions,
        short_description: baseData.shortDescription,
        description: baseData.description,
        artist_note: baseData.artistNote,
        tags: tagsArray,
        is_available: baseData.isAvailable,
        is_featured: baseData.isFeatured,
        images: baseData.images,
      })
      .eq("id", id);

    if (artworkError) {
      return { success: false, message: artworkError.message };
    }

    // 2. Sync mediums (delete all then re-insert)
    await supabase.from("artwork_mediums").delete().eq("artwork_id", id);
    if (mediumIds.length > 0) {
      const mediumInserts = mediumIds.map(mid => ({ artwork_id: id, medium_id: mid }));
      await supabase.from("artwork_mediums").insert(mediumInserts);
    }

    // 3. Sync variants (upsert)
    if (variants.length > 0) {
      const seenIds = new Set<string>();
      const variantUpserts = variants.map(v => {
        let finalId = v.id || crypto.randomUUID();
        // Prevent duplicate IDs from causing Postgres upsert conflicts
        if (seenIds.has(finalId)) {
          finalId = crypto.randomUUID();
        }
        seenIds.add(finalId);
        
        return {
          id: finalId,
          artwork_id: id,
          label: v.label,
          width_inches: v.widthInches,
          height_inches: v.heightInches,
          mrp: Math.round(v.mrp * 100),
          selling_price: Math.round(v.sellingPrice * 100),
          stock_quantity: v.stockQuantity,
          is_active: v.isActive,
          can_be_framed: v.canBeFramed,
          framing_price: v.framingPrice ? Math.round(v.framingPrice * 100) : 0,
          sku: v.sku || null,
        };
      });
      
      // Robust sync: Fetch existing, find ones to delete, then delete explicitly
      const { data: existing } = await supabase.from("artwork_variants").select("id").eq("artwork_id", id);
      const existingIds = existing?.map(v => v.id) || [];
      const currentVariantIds = variantUpserts.map(v => v.id);
      
      const idsToDelete = existingIds.filter(oldId => !currentVariantIds.includes(oldId));
      if (idsToDelete.length > 0) {
        await supabase.from("artwork_variants").delete().in("id", idsToDelete);
      }
      
      const { error: variantUpsertError } = await supabase.from("artwork_variants").upsert(variantUpserts);
      if (variantUpsertError) {
        console.error("Variant Upsert Error:", variantUpsertError);
        return { success: false, message: `Failed to save variants: ${variantUpsertError.message}` };
      }
    } else {
       await supabase.from("artwork_variants").delete().eq("artwork_id", id);
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/artworks/${baseData.slug}`);
    revalidatePath("/admin/artworks");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateArtwork] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating the artwork." };
  }
});

export const deleteArtwork = withAdminAuth(async (id: string) => {
  try {
    const supabase = createAdminClient();

    // 1. Fetch artwork id, slug, and images before deletion
    const { data: artwork } = await supabase
      .from("artworks")
      .select("id, slug, images")
      .eq("id", id)
      .single();

    // 2. Delete from Supabase
    const { error } = await supabase.from("artworks").delete().eq("id", id);
    
    if (error) {
      return { success: false, message: error.message };
    }

    // 3. Clean up Cloudinary assets and folder
    if (artwork) {
      try {
        if (Array.isArray(artwork.images)) {
          const imagesList = artwork.images as Array<{ publicId?: string; url?: string }>;
          for (const img of imagesList) {
            if (img?.publicId) {
              await deleteAsset(img.publicId);
            }
          }
        }
        // Primary: Clean up folder by immutable artwork ID
        if (artwork.id) {
          await deleteArtworkFolder(artwork.id);
        }
        // Backward compatibility: Clean up folder by slug if older artwork used slug
        if (artwork.slug && artwork.slug !== artwork.id) {
          await deleteArtworkFolder(artwork.slug);
        }
      } catch (cleanupErr) {
        console.error("Cloudinary cleanup error during artwork delete:", cleanupErr);
      }
    }
    
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/artworks");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteArtwork] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while deleting the artwork." };
  }
});

export const toggleArtworkStatus = withAdminAuth(async (id: string, isAvailable: boolean) => {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("artworks").update({ is_available: isAvailable }).eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/artworks");
    return { success: true };
  } catch (err: unknown) {
    console.error("[toggleArtworkStatus] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating artwork status." };
  }
});

export const toggleArtworkFeatured = withAdminAuth(async (id: string, isFeatured: boolean) => {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("artworks").update({ is_featured: isFeatured }).eq("id", id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/artworks");
    return { success: true };
  } catch (err: unknown) {
    console.error("[toggleArtworkFeatured] Unexpected error:", err);
    return { success: false, message: err instanceof Error ? err.message : "An unexpected error occurred while updating artwork featured status." };
  }
});
