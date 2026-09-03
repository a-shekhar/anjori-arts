import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a Buffer to Cloudinary via stream.
 */
export async function uploadStream(buffer: Buffer, folder: string): Promise<{ publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
}

/**
 * Deletes a single asset from Cloudinary by publicId.
 */
export async function deleteAsset(publicId: string): Promise<any> {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
    return null;
  }
}

/**
 * Deletes all assets in an artwork's folder and removes the folder from Cloudinary.
 */
export async function deleteArtworkFolder(slug: string): Promise<void> {
  if (!slug) return;
  const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
  const foldersToClean = [
    `anjori-arts/${envFolder}/artworks/${slug}`,
    `anjori-arts/artworks/${slug}`,
  ];

  for (const folderPath of foldersToClean) {
    try {
      // 1. Delete all assets with this folder prefix
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      // 2. Delete the folder itself
      await cloudinary.api.delete_folder(folderPath);
    } catch (error: any) {
      // If folder or resources do not exist (404), ignore silently
      if (error?.error?.http_code !== 404 && error?.http_code !== 404) {
        console.warn(`Note on deleting Cloudinary folder ${folderPath}:`, error?.message || error);
      }
    }
  }
}

