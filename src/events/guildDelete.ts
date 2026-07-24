import { Event } from '../structures/BaseCommand';
import { Guild } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { getPrismaClient } from '../database/postgresql/client';
import { logger } from '../utils/Logger';

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
