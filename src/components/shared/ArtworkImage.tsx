"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { getCloudinaryUrl, type CloudinaryTransformOptions } from "@/lib/cloudinary";
import { FALLBACK_ARTWORK_IMAGE } from "@/config/constants";
import { cn } from "@/lib/utils";

export type ArtworkImageContext = "card" | "detail" | "lightbox" | "thumbnail" | "custom";

const CONTEXT_SETTINGS: Record<
  ArtworkImageContext,
  { width?: number; quality: string | number }
> = {
  thumbnail: { width: 240, quality: "auto" },
  card: { width: 800, quality: "auto:good" },
  detail: { width: 1600, quality: "auto:best" },
  lightbox: { width: 3000, quality: "auto:best" },
  custom: { quality: "auto" },
};

export interface ArtworkImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  alt: string;
  context?: ArtworkImageContext;
  transformOptions?: CloudinaryTransformOptions;
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

/**
 * High-resilience, context-aware image component for artworks.
 *
 * 1. Delivers WebP/AVIF directly from Cloudinary edge CDN to avoid Next.js serverless timeouts.
 * 2. Preserves full master fidelity in Lightbox/Zoom modes while keeping Grid thumbnails ultra-light.
 * 3. Gracefully retries on transient connection drops and falls back to a curated placeholder.
 * 4. Zero CLS with progressive skeleton loading.
 */
export function ArtworkImage({
  src,
  alt,
  context = "card",
  transformOptions,
  fallbackSrc = FALLBACK_ARTWORK_IMAGE,
  showSkeleton = true,
  className,
  priority = false,
  fill = false,
  ...restProps
}: ArtworkImageProps) {
  const settings = CONTEXT_SETTINGS[context];
  const isCloudinary = Boolean(src && src.includes("res.cloudinary.com"));

  const initialUrl = isCloudinary
    ? getCloudinaryUrl(src, {
        width: transformOptions?.width || settings.width,
        quality: transformOptions?.quality || settings.quality,
        format: transformOptions?.format || "auto",
        crop: transformOptions?.crop || "limit",
        dpr: transformOptions?.dpr || "auto",
      })
    : src || fallbackSrc;

  // Track prevSrc to reset state during render without triggering cascading renders in useEffect
  const [prevSrc, setPrevSrc] = useState(src);
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setCurrentSrc(initialUrl);
    setRetryCount(0);
    setIsLoading(true);
  }

  const handleError = () => {
    if (retryCount < 1 && isCloudinary && src) {
      // Automatic single retry with cache buster on transient network/gateway hiccup
      setRetryCount((prev) => prev + 1);
      const separator = initialUrl.includes("?") ? "&" : "?";
      setCurrentSrc(`${initialUrl}${separator}_retry=${Date.now()}`);
    } else {
      // Graceful fallback to verified placeholder
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative size-full overflow-hidden", fill ? "absolute inset-0" : "")}>
      {/* Progressive Skeleton Loader (Zero CLS) */}
      {showSkeleton && isLoading && (
        <div
          className="absolute inset-0 z-0 animate-pulse bg-muted/50 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <Image
        {...restProps}
        src={currentSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        unoptimized={isCloudinary} // Directly fetch from Cloudinary CDN edge, eliminating serverless proxy bottleneck
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-500 ease-out",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
      />
    </div>
  );
}

