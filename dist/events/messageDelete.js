import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';
import { getRedisClient } from '../database/redis/client.js';
import config from '../../config.json' with { type: 'json' };
export const event = {
    name: 'messageDelete',
    once: false,
    async execute(message, client) {
        if (!message.guild)
            return;
        if (message.author?.bot)
            return;
        // Store deleted message in Redis for snipe command (60s TTL)
        try {
            const redis = getRedisClient();
            const snipeData = JSON.stringify({
                content: message.content || '[No text content]',
                authorId: message.author?.id,
                authorTag: message.author?.tag || 'Unknown#0000',
                authorAvatar: message.author?.displayAvatarURL({ size: 128 }) || null,
                channelId: message.channel.id,
                guildId: message.guild.id,
                attachments: message.attachments?.map(a => a.url) || [],
                embeds: message.embeds?.length || 0,
                deletedAt: new Date().toISOString(),
            });
            await redis.set(`${config.databases.redis.keyPrefix}snipe:${message.guild.id}:${message.channel.id}`, snipeData, { EX: 60 });
        }
        catch { /* Redis optional */ }
        // Log to guild log channel
        try {
            const { getPrismaClient } = await import('../database/postgresql/client.js');
            const prisma = getPrismaClient();
            const guild = await prisma.guild.findUnique({
                where: { guildId: message.guild.id },
                select: { logChannelId: true },
            });
            if (!guild?.logChannelId)
                return;
            const logChannel = message.guild.channels.cache.get(guild.logChannelId);
            if (!logChannel?.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setTitle('📝 Message Deleted')
                .setColor(COLORS.error)
                .addFields({ name: 'Author', value: message.author ? `${message.author.tag} (${message.author.id})` : 'Unknown', inline: true }, { name: 'Channel', value: `<#${message.channel.id}>`, inline: true })
                .setTimestamp();
            if (message.content) {
                embed.addFields({ name: 'Content', value: message.content.slice(0, 1024), inline: false });
            }
            if (message.attachments?.size) {
                embed.addFields({ name: 'Attachments', value: `${message.attachments.size} file(s)`, inline: true });
            }
            await logChannel.send({ embeds: [embed] });
        }
        catch { /* Optional logging */ }
    },
};
//# sourceMappingURL=messageDelete.js.map