export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image?: string | null;
  alt_text?: string | null;
};

export type ArtworkVariant = {
  id: string;
  label: string;
  widthInches: number;
  heightInches: number;
  mrp: number;
  sellingPrice: number; // in paise
  stockQuantity: number;
  isActive: boolean;
  canBeFramed?: boolean;
  framingPrice?: number;
  sku?: string | null;
};

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  price: number; // paise (₹ × 100)
  description: string;
  dimensions: string;
  surface: string;
  medium: string;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  images: { url: string; alt: string; publicId?: string }[];
  variants?: ArtworkVariant[];
  shortDescription?: string;
  artistNote?: string;
};

