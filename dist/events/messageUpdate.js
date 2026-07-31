import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
import { getRedisClient } from '../database/redis/client.js';
import config from '../../config.json' with { type: 'json' };
export const event = {
    name: 'messageUpdate',
    once: false,
    async execute(oldMessage, newMessage, client) {
        if (!newMessage.guild)
            return;
        if (newMessage.author?.bot)
            return;
        if (oldMessage.content === newMessage.content)
            return;
        // Store edited message in Redis for editsnipe command
        try {
            const redis = getRedisClient();
            const editSnipeData = JSON.stringify({
                oldContent: oldMessage.content || '[No text content]',
                newContent: newMessage.content || '[No text content]',
                authorId: newMessage.author?.id,
                authorTag: newMessage.author?.tag || 'Unknown#0000',
                authorAvatar: newMessage.author?.displayAvatarURL({ size: 128 }) || null,
                channelId: newMessage.channel.id,
                guildId: newMessage.guild.id,
                messageUrl: newMessage.url,
                editedAt: new Date().toISOString(),
            });
            await redis.set(`${config.databases.redis.keyPrefix}editsnipe:${newMessage.guild.id}:${newMessage.channel.id}`, editSnipeData, { EX: 60 });
        }
        catch { /* Redis optional */ }
        // Log to guild log channel
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guild = await prisma.guild.findUnique({
                where: { guildId: newMessage.guild.id },
                select: { logChannelId: true },
            });
            if (!guild?.logChannelId)
                return;
            const logChannel = newMessage.guild.channels.cache.get(guild.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('✏️ Message Edited')
                .setColor(COLORS.warning)
                .addFields({ name: 'Author', value: newMessage.author ? `${newMessage.author.tag} (${newMessage.author.id})` : 'Unknown', inline: true }, { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true }, { name: 'Jump to Message', value: `[Click here](${newMessage.url})`, inline: true }, { name: 'Before', value: (oldMessage.content || '[No content]').slice(0, 512), inline: false }, { name: 'After', value: (newMessage.content || '[No content]').slice(0, 512), inline: false })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional logging */ }
    },
};
//# sourceMappingURL=messageUpdate.js.map