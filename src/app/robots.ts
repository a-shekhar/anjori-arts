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
          "/account",
          "/account/*",
          "/checkout",
          "/order-success/*",
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
        disallow: [
          "/admin/*",
          "/account/*",
          "/checkout",
          "/order-success/*",
          "/cart",
          "/api/*",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

