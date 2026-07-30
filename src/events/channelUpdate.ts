// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { GuildChannel, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { COLORS } from '../constants/DesignSystem.js';

export const event: Event = {
  name: 'channelUpdate',
  once: false,
  async execute(oldChannel: GuildChannel, newChannel: GuildChannel, client: PanindiganClient) {
    if (!newChannel.guild) return;
    if (oldChannel.name === newChannel.name) return;
    try {
      const { getPrismaClient } = await import('../database/postgresql/client.js');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId: newChannel.guild.id },
        select: { logChannelId: true },
      });
      if (!guildData?.logChannelId) return;
      const logChannel = newChannel.guild.channels.cache.get(guildData.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('🔄 Channel Updated')
        .setColor(COLORS.warning)
        .addFields(
          { name: 'Before', value: oldChannel.name, inline: true },
          { name: 'After', value: newChannel.name, inline: true },
          { name: 'ID', value: newChannel.id, inline: true },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch { /* Optional */ }
  },
};
