import { logger } from '../utils/Logger.js';
export const event = {
    name: 'shardReady',
    once: false,
    async execute(shardId, unavailableGuilds, client) {
        logger.info(`Shard ${shardId} is ready`, {
            shardId,
            unavailableGuilds: unavailableGuilds?.size ?? 0,
        });
        // Start presence rotation for this shard
        if (client.config.presence.enabled) {
            const activities = client.config.presence.activities;
            let activityIndex = 0;
            const rotatePresence = () => {
                const activity = activities[activityIndex % activities.length];
                activityIndex++;
                const text = activity.text
                    .replace('{shardId}', shardId.toString())
                    .replace('{guildCount}', client.guilds.cache.size.toString())
                    .replace('{memberCount}', client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0).toString());
                client.user?.setActivity(text, { type: activity.type });
            };
            rotatePresence();
            setInterval(rotatePresence, (client.config.presence.updateIntervalSeconds || 30) * 1000);
        }
    },
};
