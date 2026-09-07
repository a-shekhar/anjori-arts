import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Returns a configured instance of the Razorpay SDK.
 * Throws if the required environment variables are not set.
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Verifies the cryptographic HMAC SHA-256 signature returned by the Razorpay Checkout modal.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("[verifyRazorpaySignature] RAZORPAY_KEY_SECRET is missing.");
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf-8");
    const signatureBuffer = Buffer.from(signature, "utf-8");

    if (generatedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
  } catch (err) {
    console.error("[verifyRazorpaySignature] Signature verification error:", err);
    return false;
  }
}

