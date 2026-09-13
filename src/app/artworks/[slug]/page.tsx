import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { getArtworkBySlug, getCategoryById, getAllArtworkSlugs } from "@/actions/shop";
import { siteConfig } from "@/config/site";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { ArtworkActions } from "@/components/shared/ArtworkActions";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { RelatedArtworks } from "@/components/shared/RelatedArtworks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllArtworkSlugs();
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const artwork = await getArtworkBySlug(resolvedParams.slug);

  if (!artwork) {
    return { title: "Artwork Not Found" };
  }

  const primaryImage = artwork.images[0];
  const title = `${artwork.title} | Anjori Arts`;
  const description = artwork.shortDescription || artwork.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/artworks/${artwork.slug}`,
    },
    openGraph: {
      title: artwork.title,
      description,
      url: `${siteConfig.url}/artworks/${artwork.slug}`,
      images: primaryImage ? [{ url: primaryImage.url, width: 1200, height: 630 }] : [],
      type: "website", // "product" is valid OG type but "website" is safer for some parsers. Assuming website per standard, though docs said product.
    },
  };
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const artwork = await getArtworkBySlug(resolvedParams.slug);

  if (!artwork) {
    notFound();
  }

  const category = await getCategoryById(artwork.categoryId);
  
  // Use first variant for initial display or default
  const defaultVariant = artwork.variants?.[0] || {
    mrp: artwork.price * 1.2,
    sellingPrice: artwork.price,
    widthInches: 0,
    heightInches: 0,
    sku: undefined as string | undefined,
  };

  // Smart multi-variant dimensions summary
  const variants = artwork.variants || [];
  let dimensionsSummary = artwork.dimensions || "Original / Standard";

  if (variants.length === 1 && variants[0].widthInches > 0 && variants[0].heightInches > 0) {
    const w = variants[0].widthInches;
    const h = variants[0].heightInches;
    dimensionsSummary = `${w}" × ${h}" (${Math.round(w * 2.54)} × ${Math.round(h * 2.54)} cm)`;
  } else if (variants.length > 1) {
    const validVariants = [...variants].filter((v) => v.widthInches > 0 && v.heightInches > 0);
    if (validVariants.length > 1) {
      const sortedByArea = validVariants.sort((a, b) => a.widthInches * a.heightInches - b.widthInches * b.heightInches);
      const smallest = sortedByArea[0];
      const largest = sortedByArea[sortedByArea.length - 1];
      dimensionsSummary = `${validVariants.length} Sizes (${smallest.widthInches}" × ${smallest.heightInches}" to ${largest.widthInches}" × ${largest.heightInches}")`;
    } else {
      dimensionsSummary = `${variants.length} Sizes Available`;
    }
  }

  const breadcrumbCrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: category?.name || "Artworks", href: `/shop?category=${artwork.categoryId}` },
    { label: artwork.title }
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    description: artwork.shortDescription || artwork.description,
    image: artwork.images.map(img => img.url),
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    category: category?.name,
    sku: defaultVariant.sku || artwork.id,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/artworks/${artwork.slug}`,
      priceCurrency: "INR",
      price: (defaultVariant.sellingPrice / 100).toFixed(2),
      availability: artwork.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="mb-6">
          <Breadcrumbs crumbs={breadcrumbCrumbs} />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 xl:col-span-6">
            <div className="sticky top-24">
              <ImageGallery images={artwork.images} />
            </div>
          </div>

          {/* Right Column: Product Info & Commerce */}
          <div className="flex flex-col lg:col-span-5 xl:col-span-6 space-y-8">
            {/* Header Info */}
            <div className="border-b border-border pb-6">
              {category && (
                <div className="mb-3 flex items-center gap-2">
                  <Link href={`/categories/${category.slug}`} className="aa-eyebrow text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </div>
              )}
              <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {artwork.title}
              </h1>
              {artwork.shortDescription && (
                <p className="mt-3 text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                  {artwork.shortDescription}
                </p>
              )}
            </div>

            {/* Actions (Price, Sizing, Framing, Buy Now, Add to Cart) */}
            <div className="border-b border-border/80 pb-8">
              <ArtworkActions artwork={artwork} category={category} />
            </div>

            {/* Artist Note */}
            {artwork.artistNote && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2.5 text-primary">
                  <Quote className="size-4 shrink-0 fill-primary/20" aria-hidden="true" />
                  <span className="font-serif text-xs font-semibold uppercase tracking-wider">Artist&apos;s Note</span>
                </div>
                <p className="font-serif text-sm sm:text-base italic leading-relaxed text-foreground/90 pl-3 border-l-2 border-primary/40">
                  &ldquo;{artwork.artistNote}&rdquo;
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">About this piece</h3>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {artwork.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-border bg-muted/10 p-5 text-sm">
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Category</span>
                {category ? (
                  <Link href={`/categories/${category.slug}`} className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    {category.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">Artworks</span>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Dimensions</span>
                <span className="font-medium text-foreground">{dimensionsSummary}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Medium</span>
                <span className="font-medium text-foreground">{artwork.medium}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Surface</span>
                <span className="font-medium text-foreground">{artwork.surface}</span>
              </div>
              {artwork.tags && artwork.tags.length > 0 && (
                <div className="col-span-full pt-3 mt-1 border-t border-border/50">
                  <span className="block text-xs font-medium text-muted-foreground mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map(tag => (
                      <span key={tag} className="rounded-md bg-background border px-2 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="rounded-2xl bg-muted/30 p-6">
              <TrustBadges />
            </div>
          </div>
        </div>

        {/* Related Artworks */}
        {category && (
          <RelatedArtworks 
            currentArtworkId={artwork.id} 
            categoryId={category.id} 
          />
        )}
      </div>
    </div>
  );
}

