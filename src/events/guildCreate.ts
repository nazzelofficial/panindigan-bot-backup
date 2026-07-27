// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { Guild } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { logger } from '../utils/Logger.js';

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
