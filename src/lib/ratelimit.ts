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

/**
 * Auth email cooldown rate limiters (1 request per 60 seconds per email):
 * - Resend Signup Verification: 1 request per 60 seconds per email
 * - Forgot Password Reset: 1 request per 60 seconds per email
 */
export const authResendRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "60 s"),
      analytics: true,
      prefix: getPrefix("auth:resend"),
    })
  : null;

export const authResetPasswordRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "60 s"),
      analytics: true,
      prefix: getPrefix("auth:reset"),
    })
  : null;

// In-memory fallback map for environments without Redis (local dev / offline)
const inMemoryAuthCooldownMap = new Map<string, number>();
const AUTH_COOLDOWN_SECONDS = 60;

export interface AuthCooldownResult {
  allowed: boolean;
  remainingSeconds: number;
}

/**
 * Enforces a 60-second cooldown for auth email actions.
 * Prioritizes distributed Upstash Redis to persist across serverless cold starts.
 * Falls back to in-memory map if Redis is not configured or fails.
 */
export async function checkAuthCooldown(
  limiter: Ratelimit | null,
  key: string
): Promise<AuthCooldownResult> {
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      if (!result.success) {
        const remainingSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        return { allowed: false, remainingSeconds };
      }
      return { allowed: true, remainingSeconds: 0 };
    } catch (error) {
      console.warn(`[RateLimit] Error checking auth cooldown for ${key}, falling back to local memory:`, error);
    }
  }

  // Fallback to in-memory map
  const now = Date.now();
  const lastSent = inMemoryAuthCooldownMap.get(key);
  if (lastSent) {
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    if (elapsedSeconds < AUTH_COOLDOWN_SECONDS) {
      return { allowed: false, remainingSeconds: AUTH_COOLDOWN_SECONDS - elapsedSeconds };
    }
  }
  inMemoryAuthCooldownMap.set(key, now);

  // Maintain lean memory
  if (inMemoryAuthCooldownMap.size > 500) {
    for (const [k, timestamp] of inMemoryAuthCooldownMap.entries()) {
      if (now - timestamp > 600_000) {
        inMemoryAuthCooldownMap.delete(k);
      }
    }
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Records an initial auth email dispatch in the cooldown tracker (e.g. at signup).
 */
export async function recordAuthCooldown(
  limiter: Ratelimit | null,
  key: string
): Promise<void> {
  if (limiter) {
    try {
      await limiter.limit(key);
    } catch (error) {
      console.warn(`[RateLimit] Error recording auth cooldown for ${key}:`, error);
    }
  }
  inMemoryAuthCooldownMap.set(key, Date.now());
}

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

