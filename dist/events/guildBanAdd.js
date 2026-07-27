import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../utils/Constants.js';
export const event = {
    name: 'guildBanAdd',
    once: false,
    async execute(ban, client) {
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guildData = await prisma.guild.findUnique({
                where: { guildId: ban.guild.id },
                select: { logChannelId: true },
            });
            if (!guildData?.logChannelId)
                return;
            const logChannel = ban.guild.channels.cache.get(guildData.logChannelId);
            if (!logChannel?.isTextBased())
                return;
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
            }
            catch { /* Audit log optional */ }
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setColor(COLORS.error)
                .setThumbnail(ban.user.displayAvatarURL({ size: 128 }))
                .addFields({ name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true }, { name: 'Moderator', value: moderator, inline: true }, { name: 'Reason', value: reason, inline: false })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
