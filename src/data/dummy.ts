/* ─────────────────────────────────────────────────────────
 * Static dummy data for the MVP shop.
 * Replace with Supabase queries once the DB is ready.
 * ───────────────────────────────────────────────────────── */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

// Base framing prices in paise (₹ × 100) mapped by category ID
export const FRAMING_PRICES: Record<string, number> = {
  "cat-1": 250000, // Madhubani
  "cat-2": 500000, // Tanjore (often elaborate wooden frames)
  "cat-3": 350000, // Pichwai
  "cat-4": 150000, // Warli
  "cat-5": 0,      // Jewelry (no framing)
};

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "madhubani",
    name: "Madhubani",
    description:
      "Traditional folk art from the Mithila region, known for geometric patterns and natural dyes.",
  },
  {
    id: "cat-2",
    slug: "tanjore",
    name: "Tanjore",
    description:
      "Classical South Indian art famous for rich colours, 22K gold foil, and semi-precious stones.",
  },
  {
    id: "cat-3",
    slug: "pichwai",
    name: "Pichwai",
    description:
      "Intricate devotional paintings originating from Nathdwara, Rajasthan.",
  },
  {
    id: "cat-4",
    slug: "warli",
    name: "Warli",
    description:
      "Tribal art from Maharashtra depicting nature, community life, and rhythmic dance.",
  },
  {
    id: "cat-5",
    slug: "jewelry",
    name: "Handcrafted Jewelry",
    description:
      "Earrings and accessories handcrafted with terracotta clay, silk threads, and lac.",
  },
];


export type ArtworkVariant = {
  id: string;
  label: string;
  widthInches: number;
  heightInches: number;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
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
  images: { url: string; alt: string }[];
  variants?: ArtworkVariant[];
  shortDescription?: string;
  artistNote?: string;
};

/* Helper – Unsplash placeholder URLs keyed by art style */
const IMG = {
  madhubani1:
    "https://images.unsplash.com/photo-1583594895781-8d0702c2db26?q=80&w=800&auto=format&fit=crop",
  madhubani2:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=800&auto=format&fit=crop",
  tanjore1:
    "https://images.unsplash.com/photo-1599557766399-52e850b55146?q=80&w=800&auto=format&fit=crop",
  tanjore2:
    "https://images.unsplash.com/photo-1605649487212-0df8dca5e7a0?q=80&w=800&auto=format&fit=crop",
  pichwai1:
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
  pichwai2:
    "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=800&auto=format&fit=crop",
  warli1:
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  warli2:
    "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=800&auto=format&fit=crop",
  jewelry1:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
  jewelry2:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
  generic1:
    "https://images.unsplash.com/photo-1579541513287-3f17a5ccc4e1?q=80&w=800&auto=format&fit=crop",
  generic2:
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
};

export const ARTWORKS: Artwork[] = [
  /* ── Madhubani (cat-1) ─────────────────────────────── */
  {
    id: "art-1",
    slug: "radha-krishna-madhubani",
    title: "Radha Krishna Under Kadamba Tree",
    categoryId: "cat-1",
    price: 450000,
    description:
      "A vibrant Madhubani depiction of Radha and Krishna under the Kadamba tree, symbolising eternal love.",
    dimensions: "15 × 22 in",
    surface: "Handmade Paper",
    medium: "Natural Dyes & Acrylic Inks",
    isAvailable: true,
    isFeatured: true,
    tags: ["radha krishna", "love", "mythology", "mithila"],
    images: [
      { url: IMG.madhubani1, alt: "Radha Krishna Madhubani painting - Main view" },
      { url: IMG.madhubani2, alt: "Radha Krishna Madhubani painting - Close up" },
      { url: IMG.generic1, alt: "Radha Krishna Madhubani painting - Frame view" }
    ],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 540000, sellingPrice: 450000, stockQuantity: 3, isActive: true },
      { id: "var-1b", label: "Standard", widthInches: 14, heightInches: 18, mrp: 620000, sellingPrice: 510000, stockQuantity: 2, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 810000, sellingPrice: 675000, stockQuantity: -1, isActive: true },
      { id: "var-2b", label: "Large", widthInches: 20, heightInches: 30, mrp: 950000, sellingPrice: 800000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-2",
    slug: "tree-of-life-madhubani",
    title: "Tree of Life",
    categoryId: "cat-1",
    price: 550000,
    description:
      "The classic Tree of Life motif in Madhubani style — harmony between flora and fauna.",
    dimensions: "18 × 24 in",
    surface: "Handmade Paper",
    medium: "Natural Dyes & Acrylic Inks",
    isAvailable: true,
    isFeatured: true,
    tags: ["tree of life", "nature", "folk", "mithila"],
    images: [{ url: IMG.madhubani2, alt: "Tree of Life Madhubani painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 660000, sellingPrice: 550000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 990000, sellingPrice: 825000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-3",
    slug: "matsya-avatar-madhubani",
    title: "Matsya Avatar – The Divine Fish",
    categoryId: "cat-1",
    price: 380000,
    description:
      "A classic Mithila composition portraying Lord Vishnu's first avatar — the divine fish.",
    dimensions: "12 × 16 in",
    surface: "Handmade Paper",
    medium: "Natural Dyes",
    isAvailable: true,
    isFeatured: false,
    tags: ["vishnu", "matsya", "mythology", "mithila"],
    images: [{ url: IMG.generic1, alt: "Matsya Avatar Madhubani painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 456000, sellingPrice: 380000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 684000, sellingPrice: 570000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-4",
    slug: "peacock-pair-madhubani",
    title: "Peacock Pair in Bloom",
    categoryId: "cat-1",
    price: 420000,
    description:
      "Two peacocks surrounded by lotus and marigold motifs, drawn with precise Bharni technique.",
    dimensions: "14 × 20 in",
    surface: "Cotton Paper",
    medium: "Acrylic Inks & Natural Dyes",
    isAvailable: true,
    isFeatured: false,
    tags: ["peacock", "nature", "bharni", "mithila"],
    images: [{ url: IMG.madhubani1, alt: "Peacock Pair Madhubani painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 504000, sellingPrice: 420000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 756000, sellingPrice: 630000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-5",
    slug: "kohbar-bridal-madhubani",
    title: "Kohbar – Bridal Chamber Art",
    categoryId: "cat-1",
    price: 620000,
    description:
      "An auspicious Kohbar painting traditionally created in the bridal chamber, symbolising fertility and prosperity.",
    dimensions: "20 × 28 in",
    surface: "Handmade Paper",
    medium: "Natural Dyes & Acrylic Inks",
    isAvailable: false,
    isFeatured: false,
    tags: ["kohbar", "wedding", "bridal", "mithila", "auspicious"],
    images: [{ url: IMG.madhubani2, alt: "Kohbar Madhubani painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 744000, sellingPrice: 620000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 1116000, sellingPrice: 930000, stockQuantity: -1, isActive: true }
    ],
  },

  /* ── Tanjore (cat-2) ───────────────────────────────── */
  {
    id: "art-6",
    slug: "goddess-lakshmi-tanjore",
    title: "Goddess Lakshmi Tanjore",
    categoryId: "cat-2",
    price: 1850000,
    description:
      "Classic Tanjore painting of Goddess Lakshmi adorned with 22K gold foil and semi-precious stones.",
    dimensions: "12 × 15 in",
    surface: "Teakwood Board",
    medium: "22K Gold Foil, Poster Colours, Stones",
    isAvailable: true,
    isFeatured: true,
    tags: ["lakshmi", "gold", "devotional", "south indian"],
    images: [{ url: IMG.tanjore1, alt: "Goddess Lakshmi Tanjore painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 2220000, sellingPrice: 1850000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 3330000, sellingPrice: 2775000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-7",
    slug: "lord-ganesha-tanjore",
    title: "Lord Ganesha – Remover of Obstacles",
    categoryId: "cat-2",
    price: 2200000,
    description:
      "A regal Tanjore portrait of Lord Ganesha with raised 22K gold muckwork and Jaipur stones.",
    dimensions: "15 × 18 in",
    surface: "Teakwood Board",
    medium: "22K Gold Foil, Jaipur Stones",
    isAvailable: true,
    isFeatured: false,
    tags: ["ganesha", "gold", "devotional", "south indian"],
    images: [{ url: IMG.tanjore2, alt: "Lord Ganesha Tanjore painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 2640000, sellingPrice: 2200000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 3960000, sellingPrice: 3300000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-8",
    slug: "lord-balaji-tanjore",
    title: "Lord Venkateshwara Balaji",
    categoryId: "cat-2",
    price: 2800000,
    description:
      "Premium Tanjore art of Lord Balaji with 22K gold foil, Kundan stones, and traditional Chettinad teakwood frame.",
    dimensions: "18 × 24 in",
    surface: "Teakwood Board",
    medium: "22K Gold Foil, Kundan Stones",
    isAvailable: true,
    isFeatured: false,
    tags: ["balaji", "venkateshwara", "tirupati", "gold", "devotional"],
    images: [{ url: IMG.tanjore1, alt: "Lord Balaji Tanjore painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 3360000, sellingPrice: 2800000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 5040000, sellingPrice: 4200000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-9",
    slug: "dancing-krishna-tanjore",
    title: "Butter Krishna – Navanitam",
    categoryId: "cat-2",
    price: 1650000,
    description:
      "An endearing depiction of baby Krishna dancing with a pot of butter, finished with 22K gold leaf.",
    dimensions: "10 × 12 in",
    surface: "Teakwood Board",
    medium: "22K Gold Foil, Poster Colours",
    isAvailable: true,
    isFeatured: false,
    tags: ["krishna", "butter", "baby", "gold", "devotional"],
    images: [{ url: IMG.tanjore2, alt: "Butter Krishna Tanjore painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 1980000, sellingPrice: 1650000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 2970000, sellingPrice: 2475000, stockQuantity: -1, isActive: true }
    ],
  },

  /* ── Pichwai (cat-3) ───────────────────────────────── */
  {
    id: "art-10",
    slug: "shrinathji-pichwai",
    title: "Shrinathji Kamal Talai",
    categoryId: "cat-3",
    price: 1200000,
    description:
      "Intricate Pichwai portraying Shrinathji amidst lotus ponds in the Nathdwara tradition.",
    dimensions: "24 × 36 in",
    surface: "Cotton Canvas",
    medium: "Stone Colours & Gold Dust",
    isAvailable: false,
    isFeatured: false,
    tags: ["shrinathji", "lotus", "devotional", "rajasthan"],
    images: [{ url: IMG.pichwai1, alt: "Shrinathji Pichwai painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 1440000, sellingPrice: 1200000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 2160000, sellingPrice: 1800000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-11",
    slug: "gau-seva-pichwai",
    title: "Gau Seva – Sacred Cows",
    categoryId: "cat-3",
    price: 950000,
    description:
      "A serene Pichwai depiction of sacred cows gathered around Shrinathji, painted in the Nathdwara palette.",
    dimensions: "20 × 30 in",
    surface: "Cotton Canvas",
    medium: "Stone Colours & Gold Dust",
    isAvailable: true,
    isFeatured: false,
    tags: ["cows", "gau seva", "devotional", "rajasthan"],
    images: [{ url: IMG.pichwai2, alt: "Gau Seva Pichwai painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 1140000, sellingPrice: 950000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 1710000, sellingPrice: 1425000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-12",
    slug: "lotus-pond-pichwai",
    title: "Kamal Talai – Lotus Pond",
    categoryId: "cat-3",
    price: 780000,
    description:
      "Symmetrical lotuses filling a sacred pond — a quintessential Pichwai motif.",
    dimensions: "18 × 24 in",
    surface: "Silk Canvas",
    medium: "Mineral Pigments & Gold Leaf",
    isAvailable: true,
    isFeatured: true,
    tags: ["lotus", "nature", "devotional", "rajasthan"],
    images: [{ url: IMG.pichwai1, alt: "Lotus Pond Pichwai painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 936000, sellingPrice: 780000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 1404000, sellingPrice: 1170000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-13",
    slug: "mor-pichwai",
    title: "Morpankh – Peacock Feather Pichwai",
    categoryId: "cat-3",
    price: 1100000,
    description:
      "An elegant Pichwai centred on the iconic peacock feather motif of Lord Krishna.",
    dimensions: "22 × 30 in",
    surface: "Cotton Canvas",
    medium: "Stone Colours & Gold Dust",
    isAvailable: true,
    isFeatured: false,
    tags: ["peacock", "morpankh", "krishna", "rajasthan"],
    images: [{ url: IMG.pichwai2, alt: "Morpankh Pichwai painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 1320000, sellingPrice: 1100000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 1980000, sellingPrice: 1650000, stockQuantity: -1, isActive: true }
    ],
  },

  /* ── Warli (cat-4) ─────────────────────────────────── */
  {
    id: "art-14",
    slug: "warli-village-dance",
    title: "Tarpa Dance Celebration",
    categoryId: "cat-4",
    price: 350000,
    description:
      "A rhythmic representation of the traditional Warli Tarpa dance in a village setting.",
    dimensions: "10 × 12 in",
    surface: "Canvas Board",
    medium: "White Acrylic on Earth Brown Base",
    isAvailable: true,
    isFeatured: false,
    tags: ["tarpa", "dance", "tribal", "village"],
    images: [{ url: IMG.warli1, alt: "Warli Tarpa Dance painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 420000, sellingPrice: 350000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 630000, sellingPrice: 525000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-15",
    slug: "warli-harvest-festival",
    title: "Harvest Festival",
    categoryId: "cat-4",
    price: 290000,
    description:
      "A lively Warli scene showing villagers celebrating a bountiful harvest under the full moon.",
    dimensions: "10 × 12 in",
    surface: "Canvas Board",
    medium: "White Acrylic on Earth Brown Base",
    isAvailable: true,
    isFeatured: false,
    tags: ["harvest", "festival", "tribal", "village", "moon"],
    images: [{ url: IMG.warli2, alt: "Warli Harvest Festival painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 348000, sellingPrice: 290000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 522000, sellingPrice: 435000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-16",
    slug: "warli-tree-of-life",
    title: "Warli Tree of Life",
    categoryId: "cat-4",
    price: 320000,
    description:
      "A large tree surrounded by Warli figures, birds, and animals in harmonious coexistence.",
    dimensions: "14 × 18 in",
    surface: "Canvas Board",
    medium: "White Acrylic on Red Ochre Base",
    isAvailable: true,
    isFeatured: false,
    tags: ["tree of life", "nature", "tribal", "village"],
    images: [{ url: IMG.warli1, alt: "Warli Tree of Life painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 384000, sellingPrice: 320000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 576000, sellingPrice: 480000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-17",
    slug: "warli-wedding-procession",
    title: "Wedding Procession",
    categoryId: "cat-4",
    price: 480000,
    description:
      "A panoramic Warli painting depicting a traditional tribal wedding procession with music and dance.",
    dimensions: "18 × 30 in",
    surface: "Canvas",
    medium: "White Acrylic on Earth Brown Base",
    isAvailable: true,
    isFeatured: false,
    tags: ["wedding", "procession", "tribal", "panoramic"],
    images: [{ url: IMG.warli2, alt: "Warli Wedding Procession painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 576000, sellingPrice: 480000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 864000, sellingPrice: 720000, stockQuantity: -1, isActive: true }
    ],
  },

  /* ── Handcrafted Jewelry (cat-5) ───────────────────── */
  {
    id: "art-18",
    slug: "peacock-jhumkas",
    title: "Terracotta Peacock Jhumkas",
    categoryId: "cat-5",
    price: 85000,
    description:
      "Hand-painted terracotta earrings featuring a delicate peacock motif.",
    dimensions: "2.5 in drop",
    surface: "Fired Clay",
    medium: "Acrylic Paint & Varnish",
    isAvailable: true,
    isFeatured: false,
    tags: ["peacock", "jhumka", "terracotta", "earrings"],
    images: [{ url: IMG.jewelry1, alt: "Terracotta Peacock Jhumkas" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 102000, sellingPrice: 85000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 153000, sellingPrice: 127500, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-19",
    slug: "lotus-stud-earrings",
    title: "Lotus Stud Earrings – Madhubani Style",
    categoryId: "cat-5",
    price: 65000,
    description:
      "Tiny lotus-motif stud earrings hand-painted in the Madhubani tradition on terracotta clay.",
    dimensions: "1 in diameter",
    surface: "Fired Clay",
    medium: "Acrylic Paint & Resin Coat",
    isAvailable: true,
    isFeatured: false,
    tags: ["lotus", "stud", "terracotta", "earrings", "madhubani"],
    images: [{ url: IMG.jewelry2, alt: "Lotus Stud Earrings" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 78000, sellingPrice: 65000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 117000, sellingPrice: 97500, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-20",
    slug: "silk-thread-chandbali",
    title: "Silk Thread Chandbali Set",
    categoryId: "cat-5",
    price: 120000,
    description:
      "Elegant crescent-moon Chandbali earrings wrapped with silk thread and finished with gold-tone findings.",
    dimensions: "3 in drop",
    surface: "Metal & Silk Thread",
    medium: "Silk Thread, Gold-Tone Alloy",
    isAvailable: true,
    isFeatured: false,
    tags: ["chandbali", "silk thread", "earrings", "festive"],
    images: [{ url: IMG.jewelry1, alt: "Silk Thread Chandbali Earrings" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 144000, sellingPrice: 120000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 216000, sellingPrice: 180000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-21",
    slug: "warli-pendant-set",
    title: "Warli Pendant & Earring Set",
    categoryId: "cat-5",
    price: 145000,
    description:
      "A matching pendant and earring set featuring hand-painted Warli motifs on wooden bases.",
    dimensions: "Pendant 2 in, Earring 1.5 in",
    surface: "Birch Wood",
    medium: "Acrylic Paint & Varnish",
    isAvailable: true,
    isFeatured: false,
    tags: ["warli", "pendant", "set", "wooden", "tribal"],
    images: [{ url: IMG.jewelry2, alt: "Warli Pendant Set" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 174000, sellingPrice: 145000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 261000, sellingPrice: 217500, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-22",
    slug: "meenakari-clay-bangles",
    title: "Meenakari Clay Bangle Pair",
    categoryId: "cat-5",
    price: 95000,
    description:
      "A pair of terracotta bangles with intricate hand-painted Meenakari-inspired patterns.",
    dimensions: "2.6 in inner diameter",
    surface: "Fired Clay",
    medium: "Acrylic Paint & Lacquer",
    isAvailable: false,
    isFeatured: false,
    tags: ["bangles", "meenakari", "terracotta", "festive"],
    images: [{ url: IMG.jewelry1, alt: "Meenakari Clay Bangles" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 114000, sellingPrice: 95000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 171000, sellingPrice: 142500, stockQuantity: -1, isActive: true }
    ],
  },

  /* ── Extra Mixed ───────────────────────────────────── */
  {
    id: "art-23",
    slug: "durga-maa-madhubani",
    title: "Durga Maa – Shakti Swaroop",
    categoryId: "cat-1",
    price: 720000,
    description:
      "A powerful Madhubani composition of Goddess Durga in her ten-armed form, flanked by lotuses and lions.",
    dimensions: "22 × 30 in",
    surface: "Handmade Paper",
    medium: "Natural Dyes & Acrylic Inks",
    isAvailable: true,
    isFeatured: false,
    tags: ["durga", "shakti", "mythology", "mithila", "navratri"],
    images: [{ url: IMG.generic2, alt: "Durga Maa Madhubani painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 864000, sellingPrice: 720000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 1296000, sellingPrice: 1080000, stockQuantity: -1, isActive: true }
    ],
  },
  {
    id: "art-24",
    slug: "radha-krishna-raas-pichwai",
    title: "Raas Leela – Pichwai",
    categoryId: "cat-3",
    price: 1450000,
    description:
      "A grand Pichwai composition depicting the divine Raas Leela of Radha and Krishna.",
    dimensions: "30 × 40 in",
    surface: "Cotton Canvas",
    medium: "Stone Colours, Gold Dust & Natural Dyes",
    isAvailable: true,
    isFeatured: true,
    tags: ["raas leela", "radha krishna", "devotional", "rajasthan", "grand"],
    images: [{ url: IMG.pichwai1, alt: "Raas Leela Pichwai painting" }],
    shortDescription: "A beautiful handcrafted piece of art.",
    artistNote: "Creating this piece brought me immense joy, and I hope it brings peace to your home.",
    variants: [
      { id: "var-1", label: "Standard", widthInches: 12, heightInches: 16, mrp: 1740000, sellingPrice: 1450000, stockQuantity: 3, isActive: true },
      { id: "var-2", label: "Large", widthInches: 18, heightInches: 24, mrp: 2610000, sellingPrice: 2175000, stockQuantity: -1, isActive: true }
    ],
  },
];
