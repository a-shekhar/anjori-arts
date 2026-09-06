/**
 * Category cover image mapping and fallback resolution
 * Maps every category slug to its authentic, high-quality local image in public/images/categories/
 */

export interface CategoryImageData {
  image: string;
  alt: string;
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, CategoryImageData> = {
  madhubani: {
    image: "/images/categories/madhubani.jpg",
    alt: "Handcrafted authentic Madhubani painting depicting traditional peacocks, fish, and Tree of Life with natural mineral dyes",
  },
  tanjore: {
    image: "/images/categories/tanjore.jpg",
    alt: "Classical Tanjore gold foil relief painting of Lord Krishna with rich 22-karat gold leaf and gemstone embellishments",
  },
  warli: {
    image: "/images/categories/warli.jpg",
    alt: "Traditional Warli tribal painting on red-ochre clay surface depicting the circular Tarpa harvest dance in rice pigment",
  },
  "mythological-devotional": {
    image: "/images/categories/mythological-devotional.jpg",
    alt: "Original monochrome charcoal and acrylic painting of Lord Ganesha on deep black canvas by Anjori Arts",
  },
  contemporary: {
    image: "/images/categories/contemporary.jpg",
    alt: "Contemporary Indian fine art gallery painting with expressive impasto palette knife textures and gold leaf accents",
  },
  portraiture: {
    image: "/images/categories/portraiture.jpg",
    alt: "Bespoke fine art oil painting portrait of an Indian woman with classical chiaroscuro candlelight illumination",
  },
  figurative: {
    image: "/images/categories/figurative.jpg",
    alt: "Original narrative figurative painting celebrating the Chipko Movement and rural Indian heritage by Anjori Arts",
  },
  "customised-branding": {
    image: "/images/categories/customised-branding.jpg",
    alt: "Bespoke artisanal branding identity mockup with metallic gold lotus emblem, calligraphy pen, and custom wax seal",
  },
  "poster-designing": {
    image: "/images/categories/poster-designing.jpg",
    alt: "Vintage Indian art exhibition poster design with intricate block-print ornamental borders and classical typography",
  },
  cyanotype: {
    image: "/images/categories/cyanotype.jpg",
    alt: "Botanical Prussian blue cyanotype sun-print of wild ferns and wildflowers on deckled-edge cotton rag paper",
  },
  earrings: {
    image: "/images/categories/earrings.jpg",
    alt: "Handcrafted artisan terracotta clay jhumka earrings with traditional Indian hand-painted motifs on cream linen",
  },
  mandala: {
    image: "/images/categories/mandala.jpg",
    alt: "Original radiant lotus deity mandala painting with jewel-toned cerulean blue and gold petals by Anjori Arts",
  },
};

/**
 * Resolves the cover image for a category, prioritizing explicit cover_image from DB
 * but falling back to the local high-res curated image when empty or external.
 */
export function getCategoryCoverImage(category: {
  slug?: string;
  cover_image?: string | null;
  name?: string;
}): string {
  if (category.cover_image && category.cover_image.trim() !== "" && !category.cover_image.includes("unsplash.com")) {
    return category.cover_image;
  }

  const slug = category.slug?.toLowerCase().trim() || "";
  const mapped = CATEGORY_FALLBACK_IMAGES[slug];
  if (mapped) {
    return mapped.image;
  }

  return category.cover_image || "/images/hero-radha-krishna-gold.jpg";
}

/**
 * Resolves accessible alt text for a category cover image.
 */
export function getCategoryAltText(category: {
  slug?: string;
  alt_text?: string | null;
  name?: string;
}): string {
  if (category.alt_text && category.alt_text.trim() !== "") {
    return category.alt_text;
  }

  const slug = category.slug?.toLowerCase().trim() || "";
  const mapped = CATEGORY_FALLBACK_IMAGES[slug];
  if (mapped) {
    return mapped.alt;
  }

  return `Handmade ${category.name || "traditional Indian"} paintings and art collection at Anjori Arts`;
}

