import { Event } from '../structures/BaseCommand';
import { GuildMember } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { getPrismaClient } from '../database/postgresql/client';
import { logger } from '../utils/Logger';

export const event: Event = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member: GuildMember, client: PanindiganClient) {
    logger.info(`Member left: ${member.user.tag} from ${member.guild.name}`);

    try {
      const prisma = getPrismaClient();
      
      const guildConfig = await prisma.guild.findUnique({
        where: { guildId: member.guild.id },
        select: {
          goodbyeChannelId: true,
          goodbyeMessage: true,
        },
      });

      if (guildConfig?.goodbyeChannelId && guildConfig.goodbyeMessage) {
        const goodbyeChannel = member.guild.channels.cache.get(guildConfig.goodbyeChannelId);
        if (goodbyeChannel && goodbyeChannel.isTextBased()) {
          const goodbyeMessage = guildConfig.goodbyeMessage
            .replace('{user}', member.user.tag)
            .replace('{server}', member.guild.name);

          await goodbyeChannel.send(goodbyeMessage);
        }
      }
    } catch (error) {
      logger.error(`Failed to handle guild member remove for ${member.id}:`, error);
    }
  },
};
