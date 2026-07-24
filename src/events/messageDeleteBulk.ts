import { Event } from '../structures/BaseCommand';
import { Collection, Message, EmbedBuilder, PartialMessage, TextChannel, Snowflake } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { COLORS } from '../utils/Constants';

export const event: Event = {
  name: 'messageDeleteBulk',
  once: false,
  async execute(messages: Collection<Snowflake, Message | PartialMessage>, channel: TextChannel, client: PanindiganClient) {
    if (!channel.guild) return;

    try {
      const { getPrismaClient } = await import('../database/postgresql/client');
      const prisma = getPrismaClient();
      const guild = await prisma.guild.findUnique({
        where: { guildId: channel.guild.id },
        select: { logChannelId: true },
      });

      if (!guild?.logChannelId) return;
      const logChannel = channel.guild.channels.cache.get(guild.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Bulk Messages Deleted')
        .setColor(COLORS.error)
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Messages Deleted', value: `${messages.size}`, inline: true },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch { /* Optional */ }
  },
};
