import { logger } from '../utils/Logger.js';
export const event = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.info(`🚀 Logged in as ${client.user?.tag}`);
        logger.info(`📊 Serving ${client.guilds.cache.size} guilds`);
        logger.info(`👥 Serving ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} members`);
        logger.info(`🔷 Shard ID: ${client.shardId}`);
        logger.info(`🔷 Total Shards: ${client.totalShards}`);
        await client.updatePresence();
        if (client.config.presence.perShard && client.config.presence.updateIntervalSeconds > 0) {
            setInterval(() => {
                client.updatePresence();
            }, client.config.presence.updateIntervalSeconds * 1000);
        }
        logger.info('✅ Bot is ready');
    },
};
