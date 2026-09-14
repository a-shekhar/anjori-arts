const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "anjori-arts";

export interface CloudinaryTransformOptions {
  width?: number;
  quality?: number | string;
  format?: string;
  crop?: string;
  dpr?: string | number;
}

/**
 * Transforms any Cloudinary image URL (or relative publicId) with optimal
 * delivery parameters (f_auto, q_auto, responsive width, c_limit).
 * Leaves local/external non-Cloudinary URLs completely untouched.
 */
export function getCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url) return "";

  // If not a Cloudinary URL, return as-is (e.g. local SVG, placeholder, external host)
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    quality = "auto",
    format = "auto",
    crop = "limit",
    dpr = "auto",
  } = options;

  const params: string[] = [];
  if (width) params.push(`w_${width}`);
  if (crop) params.push(`c_${crop}`);
  if (quality) params.push(`q_${quality}`);
  if (format) params.push(`f_${format}`);
  if (dpr) params.push(`dpr_${dpr}`);

  const transformString = params.join(",");
  if (!transformString) return url;

  const uploadPrefix = "/image/upload/";
  const uploadIndex = url.indexOf(uploadPrefix);
  if (uploadIndex === -1) return url;

  const beforeUpload = url.slice(0, uploadIndex + uploadPrefix.length);
  const afterUpload = url.slice(uploadIndex + uploadPrefix.length);

  // If afterUpload already starts with common transformations (e.g. w_, q_, f_, c_), replace them
  const transformRegex = /^(?:(?:[a-z]{1,3}_[^/]+,)*[a-z]{1,3}_[^/]+\/)/;
  const match = afterUpload.match(transformRegex);

  if (match) {
    const pathWithoutOldTransforms = afterUpload.slice(match[0].length);
    return `${beforeUpload}${transformString}/${pathWithoutOldTransforms}`;
  }

  return `${beforeUpload}${transformString}/${afterUpload}`;
}

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
  if (src.includes("res.cloudinary.com")) {
    return getCloudinaryUrl(src, { width, quality });
  }

  const params = [
    `w_${width}`,
    `q_${quality || "auto"}`,
    "f_auto",
    "c_limit",
    "dpr_auto",
  ].join(",");

  const cleanSrc = src.replace(/^\//, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${cleanSrc}`;
}

/**
 * Generate a tiny blur placeholder URL for next/image blurDataURL.
 */
export function getBlurUrl(urlOrPublicId: string): string {
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    return getCloudinaryUrl(urlOrPublicId, { width: 24, quality: 30, format: "auto" });
  }
  const cleanId = urlOrPublicId.replace(/^\//, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_24,q_30,f_auto/${cleanId}`;
}

/**
 * Generate an OG image URL (1200x630) for social sharing.
 */
export function getOgImageUrl(publicId: string): string {
  const cleanId = publicId.replace(/^\//, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/${cleanId}`;
}

/**
 * Extracts the publicId from any Cloudinary URL so it can be deleted or managed.
 */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return null;
  }
  const uploadPrefix = "/image/upload/";
  const uploadIndex = url.indexOf(uploadPrefix);
  if (uploadIndex === -1) return null;

  let path = url.slice(uploadIndex + uploadPrefix.length);
  // Strip version prefix like v1741234567/
  path = path.replace(/^v\d+\//, "");
  // If there were transformations before version (e.g. w_800,q_auto/v1234/folder/img.jpg), strip them
  const transformMatch = path.match(/^(?:(?:[a-z]{1,3}_[^/]+,)*[a-z]{1,3}_[^/]+\/)/);
  if (transformMatch) {
    path = path.slice(transformMatch[0].length);
    path = path.replace(/^v\d+\//, "");
  }
  // Strip query strings or hash
  path = path.split("?")[0].split("#")[0];
  // Strip file extension
  const lastDot = path.lastIndexOf(".");
  if (lastDot !== -1) {
    path = path.slice(0, lastDot);
  }
  return path || null;
}
