// @ts-nocheck
import { EmbedBuilder, } from 'discord.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getCollection } from '../database/mongodb/client.js';
import { logger } from '../utils/Logger.js';
import { COLORS } from '../utils/Constants.js';
export class StarboardHandler {
    static instance;
    static getInstance() {
        if (!StarboardHandler.instance) {
            StarboardHandler.instance = new StarboardHandler();
        }
        return StarboardHandler.instance;
    }
    async handleReactionAdd(reaction, user, client) {
        if (user.bot)
            return;
        if (!reaction.message.guild)
            return;
        const { message, emoji } = reaction;
        const guildId = message.guild.id;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId } });
        if (!guild?.starboardChannelId)
            return;
        if (guild.starboardLocked)
            return;
        const starEmoji = guild.starboardEmoji || '⭐';
        const threshold = guild.starboardThreshold || 3;
        // Check if this emoji matches the starboard emoji
        const emojiString = emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name || '⭐';
        if (emojiString !== starEmoji && emoji.name !== '⭐')
            return;
        // Don't star bot messages
        if (message.author?.bot)
            return;
        // Don't star in starboard channel
        if (message.channelId === guild.starboardChannelId)
            return;
        // Fetch full message if partial
        const fullMessage = reaction.message.partial
            ? await reaction.message.fetch()
            : reaction.message;
        const starCount = reaction.count || 0;
        if (starCount < threshold) {
            // Check if there's an existing starboard post to remove
            await this.removeFromStarboard(fullMessage.id, guild.starboardChannelId, client);
            return;
        }
        const starboardChannel = message.guild.channels.cache.get(guild.starboardChannelId);
        if (!starboardChannel?.isTextBased())
            return;
        // Check if already posted
        const collection = getCollection('starboard');
        const existing = await collection.findOne({ originalMessageId: fullMessage.id, guildId });
        if (existing?.starboardMessageId) {
            await this.updateStarCount(existing.starboardMessageId, starCount, starboardChannel, starEmoji);
        }
        else {
            await this.postToStarboard(fullMessage, starboardChannel, starCount, starEmoji, guildId);
        }
    }
    async handleReactionRemove(reaction, user, client) {
        if (user.bot)
            return;
        if (!reaction.message.guild)
            return;
        const { message, emoji } = reaction;
        const guildId = message.guild.id;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId } });
        if (!guild?.starboardChannelId)
            return;
        const starEmoji = guild.starboardEmoji || '⭐';
        const threshold = guild.starboardThreshold || 3;
        const emojiString = emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name || '⭐';
        if (emojiString !== starEmoji && emoji.name !== '⭐')
            return;
        const starCount = reaction.count || 0;
        const fullMessage = reaction.message.partial
            ? await reaction.message.fetch()
            : reaction.message;
        const starboardChannel = message.guild.channels.cache.get(guild.starboardChannelId);
        if (!starboardChannel?.isTextBased())
            return;
        if (starCount < threshold) {
            await this.removeFromStarboard(fullMessage.id, guild.starboardChannelId, client);
        }
        else {
            const collection = getCollection('starboard');
            const existing = await collection.findOne({ originalMessageId: fullMessage.id, guildId });
            if (existing?.starboardMessageId) {
                await this.updateStarCount(existing.starboardMessageId, starCount, starboardChannel, starEmoji);
            }
        }
    }
    async postToStarboard(message, starboardChannel, starCount, starEmoji, guildId) {
        try {
            const embed = this.buildStarboardEmbed(message, starCount, starEmoji);
            const files = [];
            // Include image attachment if present
            const image = message.attachments.find(a => a.contentType?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(a.name || ''));
            if (image)
                embed.setImage(image.url);
            const sent = await starboardChannel.send({
                content: `${starEmoji} **${starCount}** | <#${message.channelId}>`,
                embeds: [embed],
            });
            // Save to MongoDB
            const collection = getCollection('starboard');
            await collection.insertOne({
                guildId,
                originalMessageId: message.id,
                channelId: message.channelId,
                authorId: message.author.id,
                starboardMessageId: sent.id,
                starCount,
                content: message.content?.slice(0, 2000) || '',
                timestamp: new Date(),
            });
            logger.info('Posted to starboard', { guildId, messageId: message.id, starCount });
        }
        catch (err) {
            logger.error('Failed to post to starboard', { error: String(err) });
        }
    }
    async updateStarCount(starboardMessageId, starCount, starboardChannel, starEmoji) {
        try {
            const starboardMsg = await starboardChannel.messages.fetch(starboardMessageId).catch(() => null);
            if (!starboardMsg)
                return;
            const channelId = starboardMsg.embeds[0]?.fields.find(f => f.name === 'Channel')?.value
                || starboardMsg.content?.match(/<#(\d+)>/)?.[1] || '';
            await starboardMsg.edit({
                content: `${starEmoji} **${starCount}** | <#${channelId}>`,
            });
            // Update MongoDB
            const collection = getCollection('starboard');
            await collection.updateOne({ starboardMessageId }, { $set: { starCount, updatedAt: new Date() } });
        }
        catch (err) {
            logger.error('Failed to update starboard star count', { error: String(err) });
        }
    }
    async removeFromStarboard(originalMessageId, starboardChannelId, client) {
        try {
            const collection = getCollection('starboard');
            const entry = await collection.findOne({ originalMessageId });
            if (!entry?.starboardMessageId)
                return;
            const channel = client.channels.cache.get(starboardChannelId);
            if (channel) {
                const msg = await channel.messages.fetch(entry.starboardMessageId).catch(() => null);
                if (msg)
                    await msg.delete().catch(() => { });
            }
            await collection.deleteOne({ originalMessageId });
        }
        catch (err) {
            logger.error('Failed to remove from starboard', { error: String(err) });
        }
    }
    buildStarboardEmbed(message, starCount, starEmoji) {
        return new EmbedBuilder()
            .setColor(COLORS.gold)
            .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL({ size: 64 }),
        })
            .setDescription(message.content || '*[No text content]*')
            .addFields({ name: 'Channel', value: `<#${message.channelId}>`, inline: true }, { name: 'Jump', value: `[Click here](${message.url})`, inline: true }, { name: `${starEmoji} Stars`, value: `${starCount}`, inline: true })
            .setTimestamp(message.createdAt);
    }
    async getStarboardEntry(messageId) {
        const collection = getCollection('starboard');
        return await collection.findOne({ originalMessageId: messageId });
    }
    async getTopStarred(guildId, limit = 10) {
        const collection = getCollection('starboard');
        return await collection.find({ guildId }).sort({ starCount: -1 }).limit(limit).toArray();
    }
    async getStarboardStats(guildId) {
        const collection = getCollection('starboard');
        const posts = await collection.find({ guildId }).toArray();
        const totalStars = posts.reduce((acc, p) => acc + (p.starCount || 0), 0);
        // Find top author
        const authorCounts = {};
        for (const p of posts) {
            authorCounts[p.authorId] = (authorCounts[p.authorId] || 0) + 1;
        }
        const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        return { totalPosts: posts.length, totalStars, topAuthor };
    }
    async resetStarboard(guildId) {
        const collection = getCollection('starboard');
        const result = await collection.deleteMany({ guildId });
        return result.deletedCount;
    }
    async getRandomStarred(guildId) {
        const collection = getCollection('starboard');
        const posts = await collection.find({ guildId }).toArray();
        if (!posts.length)
            return null;
        return posts[Math.floor(Math.random() * posts.length)];
    }
}
export const starboardHandler = StarboardHandler.getInstance();
