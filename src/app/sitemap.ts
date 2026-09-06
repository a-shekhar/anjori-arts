import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: currentDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/custom-order`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/stories`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/share-story`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/returns`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/care`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
  ];

  const supabase = await createClient();

  // Fetch dynamic artworks
  const { data: artworks, error: artworksError } = await supabase
    .from("artworks")
    .select("slug, created_at")
    .eq("is_available", true);

  if (artworksError) {
    console.error("Error fetching sitemap artworks:", artworksError);
  }

  const artworkRoutes: MetadataRoute.Sitemap = (artworks || []).map((artwork) => ({
    url: `${baseUrl}/artworks/${artwork.slug}`,
    lastModified: new Date(artwork.created_at || currentDate),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  
  // Fetch dynamic categories (no timestamp columns exist on categories table)
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("slug");

  if (categoriesError) {
    console.error("Error fetching sitemap categories:", categoriesError);
  }

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch dynamic blog posts
  const { data: blogs, error: blogsError } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .not("published_at", "is", null);

  if (blogsError) {
    console.error("Error fetching sitemap blog posts:", blogsError);
  }

  const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at || currentDate),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...artworkRoutes, ...categoryRoutes, ...blogRoutes];
}
