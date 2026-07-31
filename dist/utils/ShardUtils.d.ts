import { ShardingManager } from 'discord.js';
/**
 * Utility functions for shard management and cross-shard communication.
 */
export declare class ShardUtils {
    /**
     * Broadcast a value fetch across all shards and aggregate results.
     */
    static broadcastEval<T>(manager: ShardingManager, script: string): Promise<T[]>;
    /**
     * Get the total guild count across all shards.
     */
    static getTotalGuilds(manager: ShardingManager): Promise<number>;
    /**
     * Get the total member count across all shards.
     */
    static getTotalMembers(manager: ShardingManager): Promise<number>;
    /**
     * Get shard statistics: guild count, member count, uptime per shard.
     */
    static getShardStats(manager: ShardingManager): Promise<Array<{
        shardId: number;
        guilds: number;
        members: number;
        ping: number;
        status: number;
        uptime: number;
    }>>;
    /**
     * Fetch a guild from any shard by ID.
     */
    static fetchGuild(manager: ShardingManager, guildId: string): Promise<any | null>;
    /**
     * Send a message to a specific channel from any shard.
     */
    static sendToChannel(manager: ShardingManager, channelId: string, content: string): Promise<boolean>;
    /**
     * Compute the expected shard ID for a guild.
     * Formula: (BigInt(guildId) >> 22n) % BigInt(shardCount)
     */
    static getShardIdForGuild(guildId: string, shardCount: number): number;
    /**
     * Format uptime in milliseconds to a human-readable string.
     */
    static formatUptime(ms: number): string;
    /**
     * Parse shard status code to readable string.
     */
    static statusToString(status: number): string;
}
//# sourceMappingURL=ShardUtils.d.ts.map