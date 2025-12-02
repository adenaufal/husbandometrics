import type { MiddlewareHandler } from 'hono';
import { Redis } from '@upstash/redis';

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }>;
}

class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.expiresAt <= now) {
      const expiresAt = now + windowMs;
      this.store.set(key, { count: 1, expiresAt });
      return { count: 1, ttlMs: windowMs };
    }

    existing.count += 1;
    this.store.set(key, existing);
    return { count: existing.count, ttlMs: existing.expiresAt - now };
  }
}

class RedisRateLimitStore implements RateLimitStore {
  constructor(private redis: Redis) {}

  async increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }> {
    const ttlSeconds = Math.ceil(windowMs / 1000);
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    const [count, ttl] = (await pipeline.exec()) as [number, number];

    if (ttl === -1) {
      await this.redis.expire(key, ttlSeconds);
    }

    const ttlMs = ttl > -1 ? ttl * 1000 : windowMs;
    return { count, ttlMs };
  }
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const store: RateLimitStore =
  redisUrl && redisToken ? new RedisRateLimitStore(new Redis({ url: redisUrl, token: redisToken })) : new MemoryRateLimitStore();

interface RateLimitOptions {
  windowMs: number;
  limit: number;
  prefix?: string;
}

export const rateLimit = ({ windowMs, limit, prefix = 'rl' }: RateLimitOptions): MiddlewareHandler => {
  return async (c, next) => {
    const identifier =
      c.req.header('x-forwarded-for') ?? c.req.header('cf-connecting-ip') ?? c.req.header('x-real-ip') ?? 'anonymous';
    const key = `${prefix}:${identifier}:${c.req.method}:${c.req.path}`;
    const { count, ttlMs } = await store.increment(key, windowMs);

    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(Math.max(limit - count, 0)));
    c.header('X-RateLimit-Reset', String(Date.now() + ttlMs));

    if (count > limit) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfterMs: ttlMs,
        },
        429
      );
    }

    await next();
  };
};
