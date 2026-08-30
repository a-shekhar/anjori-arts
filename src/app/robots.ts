import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/user",
          "/user/*",
          "/checkout",
          "/cart",
          "/api/*",
          "/auth/*",
        ],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Slurp", // Yahoo
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
          "facebookexternalhit",
          "Pinterestbot",
          "Applebot",
        ],
        allow: "/",
        disallow: ["/admin/*", "/user/*", "/checkout", "/cart", "/api/*"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

