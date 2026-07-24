import { Event } from '../structures/BaseCommand';
import { GuildBan, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { COLORS } from '../utils/Constants';

export const event: Event = {
  name: 'guildBanAdd',
  once: false,
  async execute(ban: GuildBan, client: PanindiganClient) {
    try {
      const { getPrismaClient } = await import('../database/postgresql/client');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId: ban.guild.id },
        select: { logChannelId: true },
      });

      if (!guildData?.logChannelId) return;
      const logChannel = ban.guild.channels.cache.get(guildData.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      // Try to fetch audit log for ban reason/moderator
      let moderator = 'Unknown';
      let reason = ban.reason || 'No reason provided';
      try {
        const auditLogs = await ban.guild.fetchAuditLogs({ type: 22 /* BAN_ADD */, limit: 1 });
        const entry = auditLogs.entries.first();
        if (entry && entry.targetId === ban.user.id) {
          moderator = entry.executor?.tag || moderator;
          reason = entry.reason || reason;
        }
      } catch { /* Audit log optional */ }

      const embed = new EmbedBuilder()
        .setTitle('🔨 Member Banned')
        .setColor(COLORS.error)
        .setThumbnail(ban.user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: 'Moderator', value: moderator, inline: true },
          { name: 'Reason', value: reason, inline: false },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch { /* Optional */ }
  },
};
