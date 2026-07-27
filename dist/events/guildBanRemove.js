import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../utils/Constants.js';
export const event = {
    name: 'guildBanRemove',
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
            let moderator = 'Unknown';
            try {
                const auditLogs = await ban.guild.fetchAuditLogs({ type: 23 /* BAN_REMOVE */, limit: 1 });
                const entry = auditLogs.entries.first();
                if (entry && entry.targetId === ban.user.id) {
                    moderator = entry.executor?.tag || moderator;
                }
            }
            catch { /* Optional */ }
            const embed = new EmbedBuilder()
                .setTitle('🔓 Member Unbanned')
                .setColor(COLORS.success)
                .setThumbnail(ban.user.displayAvatarURL({ size: 128 }))
                .addFields({ name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true }, { name: 'Unbanned by', value: moderator, inline: true })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
