import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTWORKS, CATEGORIES } from "@/data/dummy";
import { siteConfig } from "@/config/site";
import { ShopGallery } from "@/components/shared/ShopGallery";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const title = `${category.name} Paintings & Artworks | Anjori Arts`;
  const description = category.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/categories/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/categories/${category.slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.slug);

  if (!category) {
    notFound();
  }

  // Filter artworks to only those in this category
  const categoryArtworks = ARTWORKS.filter(a => a.categoryId === category.id);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: category.name }
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <Breadcrumbs crumbs={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="border-b border-border/80 px-5 pb-10 pt-4 sm:px-8 sm:pb-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">Art Category</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            {category.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {category.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            All Artworks
          </Link>
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === category.id;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm pointer-events-none"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Gallery with search, sort, and load more, but category pills hidden */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading gallery...</div>}>
        <ShopGallery 
          artworks={categoryArtworks} 
          categories={CATEGORIES} 
          initialCategory={category.id}
          hideCategoryFilter={true}
        />
      </Suspense>
    </main>
  );
}

