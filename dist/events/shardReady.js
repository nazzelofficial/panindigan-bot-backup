import { logger } from '../utils/Logger.js';
export const event = {
    name: 'shardReady',
    once: false,
    async execute(shardId, unavailableGuilds, client) {
        logger.info(`Shard ${shardId} is ready`, {
            shardId,
            unavailableGuilds: unavailableGuilds?.size ?? 0,
        });
        // Update stored shard info from the live client.shard object (set by Discord.js)
        if (client.shard) {
            client.shardId = client.shard.ids[0] ?? shardId;
            client.totalShards = client.shard.count ?? client.totalShards;
        }
        // Presence rotation is handled by the clientReady event (ready.ts).
        // Do NOT start a second interval here to avoid duplicate rotations.
    },
};
//# sourceMappingURL=shardReady.js.map