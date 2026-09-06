import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star, Quote, PlusCircle, ArrowRight, MessageCircle } from "lucide-react";
import { siteConfig, inquiryHref, hasWhatsApp } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPublicTestimonials } from "@/actions/testimonials";

export const metadata: Metadata = {
  title: "Collector Stories & Living Spaces",
  description:
    "Discover how handcrafted Indian paintings and custom commissions from Anjori Arts grace homes, sanctuaries, and living spaces across India.",
  alternates: {
    canonical: `${siteConfig.url}/stories`,
  },
  openGraph: {
    title: "Collector Stories & Living Spaces | Anjori Arts",
    description:
      "Real collector stories, reviews, and photographs of traditional Indian art installed in living rooms, foyers, and pooja spaces.",
    url: `${siteConfig.url}/stories`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Collector Stories & Living Spaces | Anjori Arts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collector Stories & Living Spaces | Anjori Arts",
    description:
      "Real collector stories, reviews, and photographs of traditional Indian art installed in living rooms, foyers, and pooja spaces.",
    images: [siteConfig.ogImage],
  },
};

export default async function StoriesPage() {
  const testimonials = await getPublicTestimonials({ limit: 20 });

  // Schema.org CollectionPage & Review JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Collector Stories — Anjori Arts",
    description:
      "Reviews and living space photographs from collectors of Anjori Arts original handmade paintings.",
    url: `${siteConfig.url}/stories`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(testimonials.length > 0
      ? {
          review: testimonials.map((t) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: t.author_name,
            },
            reviewBody: t.quote,
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(t.artwork_title
              ? {
                  itemReviewed: {
                    "@type": "VisualArtwork",
                    name: t.artwork_title,
                  },
                }
              : {}),
          })),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <section className="aa-hero-grid border-b border-border/80 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="aa-eyebrow mb-3">Collector Stories</p>
            <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              Stories from homes that carry our art.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Every painting leaves our studio with care and intention. Here is how these pieces find harmony in modern living rooms, quiet sanctuaries, and family homes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/share-story"
                className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6 text-sm")}
              >
                <PlusCircle className="mr-2 size-4" /> Share your story
              </Link>
              <Link
                href="/shop"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-6 text-sm")}
              >
                Explore artworks <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          {testimonials.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center sm:p-14">
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground">Our collector wall is opening soon.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-muted-foreground">
                Own an original handmade painting or bespoke commission from Anjori Arts? Be the first to share how your piece lives in your home.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/share-story"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-7 text-sm")}
                >
                  <PlusCircle className="mr-2 size-4" /> Share your story
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="sr-only">Collector Reviews and Living Space Photographs</h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <article
                    key={item.id}
                    className="group flex flex-col justify-between rounded-[2rem] border border-border bg-card p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      {/* Living Space Photograph */}
                      {item.image_url ? (
                        <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-secondary">
                          <Image
                            src={item.image_url}
                            alt={item.image_alt || `Handmade artwork installed in ${item.author_name}'s home`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="relative mb-5 flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-border/70 bg-muted/40 p-4 text-center">
                          <p className="font-serif text-sm italic text-muted-foreground">
                            &ldquo;A piece cherished in {item.author_location || "India"}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1" aria-label={`Rated ${item.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-4",
                              i < item.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>

                      {/* Artwork Tag */}
                      {item.artwork_title && (
                        <p className="mt-3 text-xs font-semibold tracking-wide text-primary">
                          {item.artwork_title}
                        </p>
                      )}

                      {/* Quote */}
                      <div className="relative mt-3">
                        <Quote className="absolute -left-1 -top-2 size-6 -scale-x-100 text-muted-foreground/15" />
                        <p className="relative text-sm leading-relaxed text-foreground/90 sm:text-base">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Footer / Author */}
                    <div className="mt-6 border-t border-border/60 pt-4">
                      <h3 className="font-serif text-base font-medium text-foreground">
                        {item.author_name}
                      </h3>
                      {item.author_location && (
                        <p className="text-xs text-muted-foreground">
                          {item.author_location}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Bottom Commission Banner */}
          <section className="mt-20 overflow-hidden rounded-[2rem] border border-border bg-muted/50 p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="aa-eyebrow mb-2">Bespoke commissions</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
                Ready to find a piece for your home?
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                Every custom commission begins with a conversation. Share your preferred tradition, wall dimensions, or theme, and our artists will guide the journey.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/custom-order"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-7 text-sm")}
                >
                  Request a Custom Order
                </Link>
                <a
                  href={inquiryHref}
                  target={hasWhatsApp ? "_blank" : undefined}
                  rel={hasWhatsApp ? "noopener noreferrer" : undefined}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-6 text-sm")}
                >
                  <MessageCircle className="mr-2 size-4" /> Chat with Artist
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
