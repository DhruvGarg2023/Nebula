import { getRedisClient } from '../redis/client.js';
import { RateLimitError } from '../errors/AppError.js';
import logger from '../logger/index.js';

/**
 * Redis-backed sliding window rate limiter middleware factory.
 *
 * Design decisions (per SADD Section 7.2.6):
 * - Uses a Lua script for atomic increment + TTL set (no race conditions)
 * - Configurable per-endpoint limits
 * - Returns 429 with Retry-After header and structured error body
 * - Identifies by user ID (authenticated) or IP address (unauthenticated)
 *
 * Rate limit configuration from SADD:
 *   /auth/*:       10 requests / 60s per IP
 *   /ai/*:         5 requests / 60s per user
 *   /compiler/run: 10 requests / 60s per user
 *   General API:   100 requests / 60s per user/IP
 *
 * @param {{ windowMs: number, max: number }} options - Rate limit configuration
 * @returns {import('express').RequestHandler}
 */
function rateLimiter({ windowMs = 60_000, max = 100 } = {}) {
  // Lua script: atomic increment with TTL set on first call
  // Returns [current_count, ttl_remaining_ms]
  const luaScript = `
    local key = KEYS[1]
    local limit = tonumber(ARGV[1])
    local windowMs = tonumber(ARGV[2])
    
    local current = redis.call('INCR', key)
    if current == 1 then
      redis.call('PEXPIRE', key, windowMs)
    end
    
    local ttl = redis.call('PTTL', key)
    return {current, ttl}
  `;

  return async (req, res, next) => {
    try {
      const redis = getRedisClient();

      // Identifier: userId if authenticated, otherwise IP
      const identifier = req.user?.id || req.ip || 'unknown';
      const windowSeconds = Math.ceil(windowMs / 1000);
      const key = `ratelimit:${identifier}:${req.route?.path || req.path}:${windowSeconds}`;

      const [count, ttlMs] = await redis.eval(luaScript, 1, key, max, windowMs);

      // Set rate limit headers (standard draft)
      const remaining = Math.max(0, max - count);
      const retryAfterSeconds = Math.ceil(ttlMs / 1000);

      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(remaining));
      res.set('X-RateLimit-Reset', String(retryAfterSeconds));

      if (count > max) {
        res.set('Retry-After', String(retryAfterSeconds));

        logger.warn({
          identifier,
          path: req.path,
          count,
          limit: max,
          windowMs,
        }, 'Rate limit exceeded');

        throw new RateLimitError(retryAfterSeconds, {
          limit: max,
          window: `${windowSeconds}s`,
        });
      }

      next();
    } catch (err) {
      // If it's already a RateLimitError, rethrow
      if (err instanceof RateLimitError) {
        return next(err);
      }

      // Redis connection failure — degrade gracefully (allow the request)
      logger.error({ err }, 'Rate limiter Redis error — allowing request');
      next();
    }
  };
}

export default rateLimiter;
