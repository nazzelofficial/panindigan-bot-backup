// @ts-nocheck
import { ActivityType } from 'discord.js';
import { Event } from '../structures/BaseCommand.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { logger } from '../utils/Logger.js';

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  playing: ActivityType.Playing,
  streaming: ActivityType.Streaming,
  listening: ActivityType.Listening,
  watching: ActivityType.Watching,
  competing: ActivityType.Competing,
};

export const event: Event = {
  name: 'shardReady',
  once: false,
  async execute(shardId: number, unavailableGuilds: Set<string> | undefined, client: PanindiganClient) {
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

        const activityType = ACTIVITY_TYPE_MAP[activity.type.toLowerCase()] ?? ActivityType.Playing;
        client.user?.setActivity(text, { type: activityType });
      };

      rotatePresence();
      setInterval(rotatePresence, (client.config.presence.updateIntervalSeconds || 30) * 1000);
    }
  },
};
