/**
 * Client-side high-fidelity image compression utility.
 *
 * Scales modern smartphone photos (which often exceed 10-15MB and 48MP)
 * down to a crisp gallery-grade resolution (2048px long edge at 88% quality).
 *
 * This brings file size down to ~600KB - 1.2MB, preserving fine brushwork,
 * gold foil, and texture while ensuring fast uploads that bypass serverless
 * payload limits.
 */

export interface ImageCompressionOptions {
  /**
   * Maximum length in pixels for the longest edge.
   * Default: 2048 (Full 2K resolution)
   */
  maxDimension?: number;
  /**
   * Compression quality between 0 and 1.
   * Default: 0.88 (perceptually lossless for artworks)
   */
  quality?: number;
  /**
   * Output MIME type.
   * Default: "image/jpeg"
   */
  mimeType?: "image/jpeg" | "image/webp";
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  // Guard against non-browser environments
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const {
    maxDimension = 2048,
    quality = 0.88,
    mimeType = "image/jpeg",
  } = options;

  let sourceWidth = 0;
  let sourceHeight = 0;
  let drawable: CanvasImageSource | null = null;
  let cleanup: (() => void) | null = null;

  try {
    // Attempt modern createImageBitmap with EXIF orientation support first
    if (typeof window.createImageBitmap === "function") {
      try {
        const bitmap = await window.createImageBitmap(file, {
          imageOrientation: "from-image",
        } as ImageBitmapOptions);
        sourceWidth = bitmap.width;
        sourceHeight = bitmap.height;
        drawable = bitmap;
        cleanup = () => bitmap.close();
      } catch {
        // Fall back to Image element if createImageBitmap fails (e.g. some HEIC/SVG variants)
        drawable = null;
      }
    }

    if (!drawable) {
      const objectUrl = URL.createObjectURL(file);
      cleanup = () => URL.revokeObjectURL(objectUrl);

      const img = new window.Image();
      img.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Unable to decode the selected image. Please try another photo."));
      });

      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      drawable = img;
    }

    // Determine target dimensions preserving aspect ratio
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
      if (sourceWidth >= sourceHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((sourceHeight * maxDimension) / sourceWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((sourceWidth * maxDimension) / sourceHeight);
      }
    }

    // Prepare offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      cleanup?.();
      return file;
    }

    // High quality bicubic scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Paint white backdrop if converting to JPEG to prevent transparent areas turning black
    if (mimeType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);
    cleanup?.();
    cleanup = null;

    // Convert canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, quality);
    });

    if (!blob) {
      return file;
    }

    // Format new filename with correct extension
    const extension = mimeType === "image/webp" ? ".webp" : ".jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const finalFileName = `${baseName}${extension}`;

    return new File([blob], finalFileName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    cleanup?.();
    throw error;
  }
}

