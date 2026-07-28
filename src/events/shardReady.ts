// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { logger } from '../utils/Logger.js';

export const event: Event = {
  name: 'shardReady',
  once: false,
  async execute(shardId: number, unavailableGuilds: Set<string> | undefined, client: PanindiganClient) {
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
