// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { GuildChannel, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { COLORS } from '../constants/DesignSystem.js';

export const event: Event = {
  name: 'channelDelete',
  once: false,
  async execute(channel: GuildChannel, client: PanindiganClient) {
    if (!channel.guild) return;
    try {
      const { getPrismaClient } = await import('../database/postgresql/client.js');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId: channel.guild.id },
        select: { logChannelId: true },
      });
      if (!guildData?.logChannelId || guildData.logChannelId === channel.id) return;
      const logChannel = channel.guild.channels.cache.get(guildData.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Channel Deleted')
        .setColor(COLORS.error)
        .addFields(
          { name: 'Name', value: channel.name, inline: true },
          { name: 'Type', value: channel.type.toString(), inline: true },
          { name: 'ID', value: channel.id, inline: true },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch { /* Optional */ }
  },
};
