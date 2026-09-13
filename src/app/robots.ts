import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const DISALLOWED_ROUTES = [
  "/admin",
  "/admin/*",
  "/account",
  "/account/*",
  "/checkout",
  "/order-success/*",
  "/cart",
  "/wishlist",
  "/api/*",
  "/auth/*",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_ROUTES,
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
        disallow: DISALLOWED_ROUTES,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

