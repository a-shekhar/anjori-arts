import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { WishlistView } from "@/components/account/WishlistView";
import { getUserWishlistArtworks } from "@/actions/wishlist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collector Wishlist",
  description:
    "Review your curated collection of authentic handcrafted Indian artworks at Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/wishlist`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Collector Wishlist | Anjori Arts",
    description:
      "Review your curated collection of authentic handcrafted Indian artworks at Anjori Arts.",
    url: `${siteConfig.url}/wishlist`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default async function WishlistPage() {
  const initialArtworks = await getUserWishlistArtworks();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section matching Shop and Cart pages */}
      <section className="border-b border-border bg-muted/30 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">Curated Art Treasury</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Collector Wishlist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bookmark authentic Madhubani, Tanjore, and traditional folk paintings to curate your
            collection before acquiring.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <WishlistView initialArtworks={initialArtworks} />
      </main>
    </div>
  );
}

