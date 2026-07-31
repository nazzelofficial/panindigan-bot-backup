import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
export const event = {
    name: 'channelCreate',
    once: false,
    async execute(channel, client) {
        if (!channel.guild)
            return;
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guildData = await prisma.guild.findUnique({
                where: { guildId: channel.guild.id },
                select: { logChannelId: true },
            });
            if (!guildData?.logChannelId)
                return;
            const logChannel = channel.guild.channels.cache.get(guildData.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('📢 Channel Created')
                .setColor(COLORS.success)
                .addFields({ name: 'Name', value: channel.name, inline: true }, { name: 'Type', value: channel.type.toString(), inline: true }, { name: 'ID', value: channel.id, inline: true })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional */ }
    },
};
//# sourceMappingURL=channelCreate.js.map