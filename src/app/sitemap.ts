import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: currentDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/custom-order`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/returns`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/care`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
  ];

  const supabase = await createClient();

  // Fetch dynamic artworks
  const { data: artworks } = await supabase
    .from("artworks")
    .select("slug, updated_at")
    .eq("status", "available");

  const artworkRoutes: MetadataRoute.Sitemap = (artworks || []).map((artwork) => ({
    url: `${baseUrl}/artworks/${artwork.slug}`,
    lastModified: new Date(artwork.updated_at || currentDate),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  
  // Fetch dynamic categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at");

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.updated_at || currentDate),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch dynamic blog posts
  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .not("published_at", "is", null);

  const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || currentDate),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...artworkRoutes, ...categoryRoutes, ...blogRoutes];
}
