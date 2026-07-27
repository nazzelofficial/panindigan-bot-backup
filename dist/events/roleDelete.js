import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../utils/Constants.js';
export const event = {
    name: 'roleDelete',
    once: false,
    async execute(role, client) {
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guildData = await prisma.guild.findUnique({
                where: { guildId: role.guild.id },
                select: { logChannelId: true },
            });
            if (!guildData?.logChannelId)
                return;
            const logChannel = role.guild.channels.cache.get(guildData.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Role Deleted')
                .setColor(COLORS.error)
                .addFields({ name: 'Name', value: role.name, inline: true }, { name: 'ID', value: role.id, inline: true }, { name: 'Members', value: `${role.members.size}`, inline: true })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
