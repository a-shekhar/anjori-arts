import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryBySlug, getArtworksByCategory, getAllCategorySlugs, getShopData } from "@/actions/shop";
import { siteConfig } from "@/config/site";
import { ShopGallery } from "@/components/shared/ShopGallery";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);

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
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  // Filter artworks to only those in this category
  const categoryArtworks = await getArtworksByCategory(category.id);
  const shopData = await getShopData();
  const allCategories = shopData.categories;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: category.name }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <Breadcrumbs crumbs={breadcrumbs} />
      </div>

      <header className="relative overflow-hidden bg-primary px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern-category" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-category)"></rect>
          </svg>
        </div>
        <div className="relative mx-auto max-w-3xl text-center text-primary-foreground">
          <h1 className="mb-4 font-serif text-4xl font-bold sm:text-5xl md:text-6xl">{category.name} Paintings</h1>
          <p className="text-lg opacity-90 sm:text-xl">
            {category.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            All Artworks
          </Link>
          {allCategories.map((cat) => {
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
          categories={allCategories} 
          initialCategory={category.id}
          hideCategoryFilter={true}
        />
      </Suspense>
    </div>
  );
}

