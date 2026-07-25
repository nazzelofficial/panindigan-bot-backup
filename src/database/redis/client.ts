import { createClient, RedisClientType } from 'redis';
import { loggers } from '../../utils/Logger';
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

  redisClient = createClient({ url: redisUrl }) as RedisClientType;

  redisClient.on('error', (error: Error) => {
    loggers.redis.error('Redis client error', { errorMessage: error.message, stack: error.stack });
  });

  redisClient.on('reconnecting', () => {
    loggers.redis.warn('Redis client reconnecting…');
  });

  redisClient.on('ready', () => {
    loggers.redis.debug('Redis client ready');
  });

  await redisClient.connect();
  loggers.redis.info('Redis connected successfully');

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
    loggers.redis.info('Redis disconnected');
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
  ttlSeconds?: number,
): Promise<void> {
  const client = getRedisClient();
  const ttl = ttlSeconds ?? config.databases.redis.defaultTtlSeconds;
  await client.setEx(key, ttl, value as string);
}

export async function getCache(key: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(key);
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) await client.del(keys);
}

export async function setCooldown(
  userId: string,
  guildId: string,
  command: string,
  ttlSeconds: number,
): Promise<void> {
  const key = getCacheKey('cooldown', userId, guildId, command);
  await setCache(key, '1', ttlSeconds);
}

export async function getCooldown(
  userId: string,
  guildId: string,
  command: string,
): Promise<number> {
  const key = getCacheKey('cooldown', userId, guildId, command);
  const client = getRedisClient();
  const ttl = await client.ttl(key);
  return ttl > 0 ? ttl : 0;
}
