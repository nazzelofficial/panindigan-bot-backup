import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../utils/Constants.js';
export const event = {
    name: 'messageDeleteBulk',
    once: false,
    async execute(messages, channel, client) {
        if (!channel.guild)
            return;
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guild = await prisma.guild.findUnique({
                where: { guildId: channel.guild.id },
                select: { logChannelId: true },
            });
            if (!guild?.logChannelId)
                return;
            const logChannel = channel.guild.channels.cache.get(guild.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Bulk Messages Deleted')
                .setColor(COLORS.error)
                .addFields({ name: 'Channel', value: `<#${channel.id}>`, inline: true }, { name: 'Messages Deleted', value: `${messages.size}`, inline: true })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
