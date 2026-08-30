import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Anjori Arts",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#5f9795",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
