import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
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
    sellingPrice: artwork.price
  };

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
    description: artwork.description,
    image: artwork.images.map(img => img.url),
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
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
    <main className="min-h-screen bg-background">
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

          {/* Right Column: Product Info */}
          <div className="flex flex-col lg:col-span-5 xl:col-span-6">
            {/* Header Info */}
            <div className="mb-6 border-b border-border pb-6">
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
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">About this piece</h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {artwork.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-muted/10 p-5 text-sm">
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Base Dimensions</span>
                <span className="font-medium text-foreground">{artwork.dimensions}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Surface</span>
                <span className="font-medium text-foreground">{artwork.surface}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Medium</span>
                <span className="font-medium text-foreground">{artwork.medium}</span>
              </div>
              {artwork.tags.length > 0 && (
                <div className="col-span-2 pt-2 mt-2 border-t border-border/50">
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

            {/* Actions (Size, Add to Cart, WhatsApp) */}
            <div className="mb-10">
              <ArtworkActions artwork={artwork} />
            </div>

            {/* Artist Note */}
            {artwork.artistNote && (
              <div className="mb-10 relative rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-inner">
                <div className="absolute -left-3 -top-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <span className="font-serif text-xl leading-none">&quot;</span>
                </div>
                <h4 className="mb-2 text-sm font-semibold text-primary">Artist&apos;s Note</h4>
                <p className="font-serif text-sm italic leading-relaxed text-muted-foreground sm:text-base">
                  {artwork.artistNote}
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mb-10 rounded-2xl bg-muted/30 p-6">
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
    </main>
  );
}

