import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Shopping Bag",
  description:
    "Review your selected handcrafted Indian artworks, frames, and items before completing your order at Anjori Arts.",
  alternates: {
    canonical: `${siteConfig.url}/cart`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Shopping Bag | Anjori Arts",
    description:
      "Review your selected handcrafted Indian artworks, frames, and items before completing your order at Anjori Arts.",
    url: `${siteConfig.url}/cart`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section matching Shop and Custom Orders */}
      <section className="border-b border-border bg-muted/30 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">Review Your Selection</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Shopping Bag
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Review your selected original artworks, custom framing options, and complimentary insured shipping details.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <CartView />
      </main>
    </div>
  );
}
