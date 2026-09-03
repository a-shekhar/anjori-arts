import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getShopData } from "@/actions/shop";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Art Traditions & Categories",
  description:
    "Explore authentic Indian art traditions and collections at Anjori Arts, including Madhubani, Tanjore, Warli, Mandala, and contemporary bespoke designs.",
  alternates: {
    canonical: `${siteConfig.url}/categories`,
  },
  openGraph: {
    title: "Art Traditions & Categories | Anjori Arts",
    description:
      "Explore authentic Indian art traditions and collections at Anjori Arts, including Madhubani, Tanjore, Warli, Mandala, and contemporary bespoke designs.",
    url: `${siteConfig.url}/categories`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default async function CategoriesPage() {
  const { categories, artworks } = await getShopData();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Categories" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 sm:py-6 lg:px-10">
        <Breadcrumbs crumbs={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="border-b border-border/80 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">Living Heritage</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Art Traditions &amp; Categories
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Immerse yourself in authentic Indian art heritage—from the symbolic folk storytelling of Madhubani
            and Warli to meditative Mandalas and classical Tanjore gold leaf artistry.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = artworks.filter((art) => art.categoryId === category.id).length;

            return (
              <article
                key={category.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-muted"
                >
                  {category.cover_image ? (
                    <Image
                      src={category.cover_image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={cn(
                        "aa-art-card h-full w-full transition-transform duration-300 group-hover:scale-105",
                        `aa-art-card-${category.slug}`
                      )}
                    />
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-md shadow-xs">
                    {count} {count === 1 ? "Artwork" : "Artworks"}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      <Link href={`/categories/${category.slug}`}>{category.name}</Link>
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline"
                    >
                      Explore {category.name} Collection
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Discovery CTA Banner */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">
        <div className="rounded-3xl border border-border bg-muted/40 p-8 text-center sm:p-12 lg:p-16">
          <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="size-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Explore our comprehensive shop gallery featuring all available original paintings, or commission a
            bespoke artwork tailored specifically to your space.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "rounded-full px-8 py-6 text-base")}
            >
              Browse All Artworks
            </Link>
            <Link
              href="/custom-order"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 py-6 text-base")}
            >
              Discuss a Commission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

