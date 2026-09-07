import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client using Upstash REST API
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

/**
 * Rate limiters configured with sliding windows:
 * Environment tag to namespace Redis keys when sharing the same database between dev and prod.
 * - 'prod' on Vercel production deployment or production runtime
 * - 'preview' on Vercel preview branch deployments
 * - 'dev' on local development
 */
export const redisEnv =
  process.env.VERCEL_ENV === "production"
    ? "prod"
    : process.env.VERCEL_ENV === "preview"
    ? "preview"
    : process.env.NODE_ENV === "production"
    ? "prod"
    : "dev";

const getPrefix = (feature: string) => `anjori:${redisEnv}:${feature}`;

/**
 * Rate limiters configured with sliding windows and environment namespacing:
 * - Contact: 5 submissions per 10 minutes per IP
 * - Custom Order: 3 submissions per 30 minutes per IP (protects Cloudinary storage & Resend emails)
 * - Checkout: 5 order attempts per 15 minutes per IP
 */
export const contactRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: getPrefix("contact"),
    })
  : null;

export const customOrderRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "30 m"),
      analytics: true,
      prefix: getPrefix("custom-order"),
    })
  : null;

export const checkoutRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: getPrefix("checkout"),
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks rate limit with fail-open resilience.
 * If Redis is not configured or an unexpected network failure occurs,
 * it logs a warning and allows the request through so legitimate customers are never blocked.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.warn(`[RateLimit] Error checking rate limit for ${identifier}, failing open:`, error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Extracts client IP from standard HTTP headers.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

