import { createClient, RedisClientType } from 'redis';
import config from '../../../config.json';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env[config.databases.redis.urlEnv];
  
  if (!redisUrl) {
    throw new Error(`Redis URL not found in environment variable: ${config.databases.redis.urlEnv}`);
  }

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (error) => {
    console.error('Redis Client Error:', error);
  });

  await redisClient.connect();
  console.log('✅ Redis connected successfully');
  
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis not initialized or not connected. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌 Redis disconnected');
  }
}

export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.isOpen;
}

export function getCacheKey(...parts: string[]): string {
  return `${config.databases.redis.keyPrefix}${parts.join(':')}`;
}

export async function setCache(
  key: string,
  value: string | number | Buffer,
  ttlSeconds?: number
): Promise<void> {
  const client = getRedisClient();
  const ttl = ttlSeconds ?? config.databases.redis.defaultTtlSeconds;
  await client.setEx(key, ttl, value);
}

export async function getCache(key: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(key);
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}

export async function setCooldown(
  userId: string,
  guildId: string,
  command: string,
  ttlSeconds: number
): Promise<void> {
  const key = getCacheKey('cooldown', userId, guildId, command);
  await setCache(key, '1', ttlSeconds);
}

export async function getCooldown(
  userId: string,
  guildId: string,
  command: string
): Promise<number> {
  const key = getCacheKey('cooldown', userId, guildId, command);
  const client = getRedisClient();
  const ttl = await client.ttl(key);
  return ttl > 0 ? ttl : 0;
}
