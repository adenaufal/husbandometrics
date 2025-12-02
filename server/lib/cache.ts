import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class InMemoryCache implements CacheClient {
  private store = new Map<string, { expiresAt: number; value: unknown }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (entry.expiresAt < now) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { expiresAt, value });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class RedisCache implements CacheClient {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    return (await this.redis.get<T>(key)) ?? null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    await this.redis.set(key, value, { ex: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

export const cacheClient: CacheClient =
  redisUrl && redisToken ? new RedisCache(new Redis({ url: redisUrl, token: redisToken })) : new InMemoryCache();

export const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 900);
