const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

/**
 * Custom Cloudinary loader for next/image.
 * Automatically serves WebP/AVIF, responsive sizes, and retina images.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const params = [
    `w_${width}`,
    `q_${quality || "auto"}`,
    "f_auto", // Auto WebP/AVIF based on browser support
    "c_limit", // Don't upscale beyond original
    "dpr_auto", // Retina support
  ].join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${src}`;
}

/**
 * Generate a tiny blur placeholder URL for next/image blurDataURL.
 */
export function getBlurUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_10,q_10,f_auto/${publicId}`;
}

/**
 * Generate an OG image URL (1200x630) for social sharing.
 */
export function getOgImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/${publicId}`;
}
