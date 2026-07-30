// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { Role, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { COLORS } from '../constants/DesignSystem.js';

export const event: Event = {
  name: 'roleCreate',
  once: false,
  async execute(role: Role, client: PanindiganClient) {
    try {
      const { getPrismaClient } = await import('../database/postgresql/client.js');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId: role.guild.id },
        select: { logChannelId: true },
      });
      if (!guildData?.logChannelId) return;
      const logChannel = role.guild.channels.cache.get(guildData.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setTitle('🎭 Role Created')
        .setColor(role.color || COLORS.success)
        .addFields(
          { name: 'Name', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
          { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch { /* Optional */ }
  },
};
