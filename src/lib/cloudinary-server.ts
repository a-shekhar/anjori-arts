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

