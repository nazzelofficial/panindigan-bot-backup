import { Event } from '../structures/BaseCommand';
import { Guild } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { getPrismaClient } from '../database/postgresql/client';
import { logger } from '../utils/Logger';

export const event: Event = {
  name: 'guildCreate',
  once: false,
  async execute(guild: Guild, client: PanindiganClient) {
    logger.info(`Joined guild: ${guild.name} (${guild.id})`);

    try {
      const prisma = getPrismaClient();
      
      await prisma.guild.upsert({
        where: { guildId: guild.id },
        update: {},
        create: {
          guildId: guild.id,
          prefix: client.config.bot.prefix,
          language: client.config.bot.defaultLanguage,
        },
      });

      logger.info(`Created/updated guild record for ${guild.id}`);
    } catch (error) {
      logger.error(`Failed to create guild record for ${guild.id}:`, error);
    }
  },
};
