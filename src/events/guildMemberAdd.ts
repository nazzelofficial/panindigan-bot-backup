import { Event } from '../structures/BaseCommand';
import { GuildMember } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { getPrismaClient } from '../database/postgresql/client';
import { logger } from '../utils/Logger';
import { Formatter } from '../utils/Formatter';

export const event: Event = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member: GuildMember, client: PanindiganClient) {
    logger.info(`Member joined: ${member.user.tag} in ${member.guild.name}`);

    try {
      const prisma = getPrismaClient();
      
      await prisma.user.upsert({
        where: {
          userId_guildId: {
            userId: member.id,
            guildId: member.guild.id,
          },
        },
        update: {},
        create: {
          userId: member.id,
          guildId: member.guild.id,
          walletBalance: client.config.economy.startingBalance,
          bankBalance: 0,
          xp: 0,
          level: 0,
        },
      });

      const guildConfig = await prisma.guild.findUnique({
        where: { guildId: member.guild.id },
        select: {
          welcomeChannelId: true,
          welcomeMessage: true,
          autoRoleId: true,
          botRoleId: true,
        },
      });

      if (guildConfig?.autoRoleId && !member.user.bot) {
        await member.roles.add(guildConfig.autoRoleId).catch(() => {});
      }

      if (guildConfig?.botRoleId && member.user.bot) {
        await member.roles.add(guildConfig.botRoleId).catch(() => {});
      }

      if (guildConfig?.welcomeChannelId && guildConfig.welcomeMessage) {
        const welcomeChannel = member.guild.channels.cache.get(guildConfig.welcomeChannelId);
        if (welcomeChannel && welcomeChannel.isTextBased()) {
          const welcomeMessage = guildConfig.welcomeMessage
            .replace('{user}', member.toString())
            .replace('{server}', member.guild.name)
            .replace('{memberCount}', member.guild.memberCount.toString());

          await welcomeChannel.send(welcomeMessage);
        }
      }

      logger.info(`Created user record for ${member.id} in ${member.guild.id}`);
    } catch (error) {
      logger.error(`Failed to handle guild member add for ${member.id}:`, error);
    }
  },
};
