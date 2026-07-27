// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { MessageReaction, User, PartialMessageReaction, PartialUser, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { COLORS } from '../utils/Constants.js';
import { getCollection } from '../database/mongodb/client.js';

export const event: Event = {
  name: 'messageReactionAdd',
  once: false,
  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: PanindiganClient) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    // Fetch partial data if needed
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }
    if (reaction.message.partial) {
      try { await reaction.message.fetch(); } catch { return; }
    }

    const guildId = reaction.message.guild.id;

    try {
      const { getPrismaClient } = await import('../database/postgresql/client.js');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId },
        select: {
          starboardChannelId: true,
          starboardEmoji: true,
          starboardThreshold: true,
          starboardLocked: true,
        },
      });

      if (!guildData?.starboardChannelId || guildData.starboardLocked) return;

      const starEmoji = guildData.starboardEmoji || '⭐';
      const reactionEmoji = reaction.emoji.name || reaction.emoji.toString();

      if (reactionEmoji !== starEmoji) return;

      const threshold = guildData.starboardThreshold || 3;
      const reactionCount = reaction.count ?? 0;

      if (reactionCount < threshold) return;

      const starboardChannel = reaction.message.guild.channels.cache.get(guildData.starboardChannelId) as TextChannel;
      if (!starboardChannel?.isTextBased()) return;

      // Check if already in starboard
      const starboardCol = getCollection('starboard');
      const existing = await starboardCol.findOne({
        messageId: reaction.message.id,
        guildId,
      });

      const embed = new EmbedBuilder()
        .setColor(COLORS.gold)
        .setAuthor({
          name: reaction.message.author?.tag || 'Unknown',
          iconURL: reaction.message.author?.displayAvatarURL({ size: 64 }),
        })
        .setDescription(reaction.message.content || '*[No text content]*')
        .addFields(
          { name: 'Channel', value: `<#${reaction.message.channel.id}>`, inline: true },
          { name: 'Stars', value: `${starEmoji} ${reactionCount}`, inline: true },
          { name: 'Jump', value: `[Click here](${reaction.message.url})`, inline: true },
        )
        .setTimestamp(reaction.message.createdAt);

      if (reaction.message.attachments?.size) {
        const img = reaction.message.attachments.find(a => a.contentType?.startsWith('image/'));
        if (img) embed.setImage(img.url);
      }

      if (!existing) {
        const sent = await starboardChannel.send({ embeds: [embed] });
        await starboardCol.insertOne({
          messageId: reaction.message.id,
          starboardMessageId: sent.id,
          guildId,
          channelId: reaction.message.channel.id,
          authorId: reaction.message.author?.id,
          stars: reactionCount,
          createdAt: new Date(),
        });
      } else {
        // Update star count
        try {
          const sbMsg = await starboardChannel.messages.fetch(existing.starboardMessageId);
          await sbMsg.edit({ embeds: [embed] });
          await starboardCol.updateOne({ messageId: reaction.message.id, guildId }, { $set: { stars: reactionCount } });
        } catch { /* Message may have been deleted */ }
      }
    } catch { /* Optional */ }
  },
};
