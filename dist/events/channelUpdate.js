import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
export const event = {
    name: 'channelUpdate',
    once: false,
    async execute(oldChannel, newChannel, client) {
        if (!newChannel.guild)
            return;
        if (oldChannel.name === newChannel.name)
            return;
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guildData = await prisma.guild.findUnique({
                where: { guildId: newChannel.guild.id },
                select: { logChannelId: true },
            });
            if (!guildData?.logChannelId)
                return;
            const logChannel = newChannel.guild.channels.cache.get(guildData.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('🔄 Channel Updated')
                .setColor(COLORS.warning)
                .addFields({ name: 'Before', value: oldChannel.name, inline: true }, { name: 'After', value: newChannel.name, inline: true }, { name: 'ID', value: newChannel.id, inline: true })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
//# sourceMappingURL=channelUpdate.js.map