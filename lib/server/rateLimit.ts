// lib/server/rateLimit.ts
// Simple rate limiting using in-memory store

import { NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in ms
const MAX_REQUESTS = 30; // 30 requests per 5 minutes

// In-memory rate limiting (production should use Redis or Supabase table)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter
 * Production should use Redis or a Supabase table for distributed rate limiting
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // No record or expired - create new window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetAt - now) / 1000); // seconds
    return { allowed: false, retryAfter };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

/**
 * Get client identifier for rate limiting (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Middleware helper to apply rate limiting
 */
export function withRateLimit(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const identifier = getClientIdentifier(req);
    const { allowed, retryAfter } = checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(MAX_REQUESTS),
            'X-RateLimit-Window': String(RATE_LIMIT_WINDOW / 1000),
          },
        }
      );
    }

    return handler(req);
  };
}
