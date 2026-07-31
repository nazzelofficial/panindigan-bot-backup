import { RedisClientType } from 'redis';
export declare function connectRedis(): Promise<RedisClientType>;
export declare function getRedisClient(): RedisClientType;
export declare function disconnectRedis(): Promise<void>;
export declare function isRedisConnected(): boolean;
export declare function getCacheKey(...parts: string[]): string;
export declare function setCache(key: string, value: string | number | Buffer, ttlSeconds?: number): Promise<void>;
export declare function getCache(key: string): Promise<string | null>;
export declare function deleteCache(key: string): Promise<void>;
export declare function deleteCachePattern(pattern: string): Promise<void>;
export declare function setCooldown(userId: string, guildId: string, command: string, ttlSeconds: number): Promise<void>;
export declare function getCooldown(userId: string, guildId: string, command: string): Promise<number>;
//# sourceMappingURL=client.d.ts.map