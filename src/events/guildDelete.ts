// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { Guild } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { logger } from '../utils/Logger.js';

export const event: Event = {
  name: 'guildDelete',
  once: false,
  async execute(guild: Guild, client: PanindiganClient) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);

    try {
      const prisma = getPrismaClient();
      
      await prisma.guild.delete({
        where: { guildId: guild.id },
      });

      logger.info(`Deleted guild record for ${guild.id}`);
    } catch (error) {
      logger.error(`Failed to delete guild record for ${guild.id}:`, error);
    }
  },
};
