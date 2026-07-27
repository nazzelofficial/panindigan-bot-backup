/**
 * Utility functions for shard management and cross-shard communication.
 */
export class ShardUtils {
    /**
     * Broadcast a value fetch across all shards and aggregate results.
     */
    static async broadcastEval(manager, script) {
        const results = await manager.broadcastEval(eval(`() => { ${script} }`));
        return results;
    }
    /**
     * Get the total guild count across all shards.
     */
    static async getTotalGuilds(manager) {
        const counts = await manager.broadcastEval((c) => c.guilds.cache.size);
        return counts.reduce((a, b) => a + b, 0);
    }
    /**
     * Get the total member count across all shards.
     */
    static async getTotalMembers(manager) {
        const counts = await manager.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
        return counts.reduce((a, b) => a + b, 0);
    }
    /**
     * Get shard statistics: guild count, member count, uptime per shard.
     */
    static async getShardStats(manager) {
        const results = await manager.broadcastEval((c) => ({
            guilds: c.guilds.cache.size,
            members: c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
            ping: c.ws.ping,
            status: c.ws.status,
            uptime: c.uptime ?? 0,
        }));
        return results.map((r, i) => ({ shardId: i, ...r }));
    }
    /**
     * Fetch a guild from any shard by ID.
     */
    static async fetchGuild(manager, guildId) {
        const results = await manager.broadcastEval((c, { id }) => c.guilds.cache.get(id) ? {
            id: c.guilds.cache.get(id).id,
            name: c.guilds.cache.get(id).name,
            memberCount: c.guilds.cache.get(id).memberCount,
        } : null, { context: { id: guildId } });
        return results.find(r => r !== null) || null;
    }
    /**
     * Send a message to a specific channel from any shard.
     */
    static async sendToChannel(manager, channelId, content) {
        const results = await manager.broadcastEval(async (c, { chId, msg }) => {
            const ch = c.channels.cache.get(chId);
            if (ch && ch.send) {
                try {
                    await ch.send(msg);
                    return true;
                }
                catch {
                    return false;
                }
            }
            return false;
        }, { context: { chId: channelId, msg: content } });
        return results.some(Boolean);
    }
    /**
     * Compute the expected shard ID for a guild.
     * Formula: (BigInt(guildId) >> 22n) % BigInt(shardCount)
     */
    static getShardIdForGuild(guildId, shardCount) {
        return Number(BigInt(guildId) >> BigInt(22)) % shardCount;
    }
    /**
     * Format uptime in milliseconds to a human-readable string.
     */
    static formatUptime(ms) {
        const s = Math.floor(ms / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        const parts = [];
        if (d)
            parts.push(`${d}d`);
        if (h)
            parts.push(`${h}h`);
        if (m)
            parts.push(`${m}m`);
        parts.push(`${sec}s`);
        return parts.join(' ');
    }
    /**
     * Parse shard status code to readable string.
     */
    static statusToString(status) {
        const statuses = {
            0: '✅ Ready',
            1: '🔄 Connecting',
            2: '🔄 Reconnecting',
            3: '⏸️ Idle',
            4: '⏳ Nearly',
            5: '❌ Disconnected',
            6: '🔑 Waiting for guilds',
            7: '🔍 Identifying',
            8: '🔄 Resuming',
        };
        return statuses[status] || `❓ Unknown (${status})`;
    }
}
