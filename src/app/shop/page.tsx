import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getShopData } from "@/actions/shop";
import { ShopGallery } from "@/components/shared/ShopGallery";

export const metadata: Metadata = {
  title: "Shop Original Indian Art",
  description:
    "Browse our collection of authentic, handmade Madhubani, Tanjore, Warli, and Mandala paintings, alongside modern bespoke designs.",
  alternates: {
    canonical: `${siteConfig.url}/shop`,
  },
  openGraph: {
    title: "Shop Original Indian Art | Anjori Arts",
    description:
      "Discover curated, one-of-a-kind Madhubani, Tanjore, Mandala, and Warli paintings. Handcrafted with love.",
    url: `${siteConfig.url}/shop`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default async function ShopPage() {
  const { artworks, categories } = await getShopData();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">The Gallery</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Shop Original Artworks
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover our curated collection of traditional Indian paintings, meditative Mandalas,
            and bespoke contemporary artwork. Each piece is meticulously handcrafted.
          </p>
        </div>
      </section>

      {/* Gallery with search, filters, sort, and load more */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading gallery...</div>}>
        <ShopGallery artworks={artworks} categories={categories} />
      </Suspense>
    </main>
  );
}
