import { Event } from '../structures/BaseCommand';
import { MessageReaction, User, PartialMessageReaction, PartialUser, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient';
import { getCollection } from '../database/mongodb/client';

export const event: Event = {
  name: 'messageReactionRemove',
  once: false,
  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: PanindiganClient) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }

    const guildId = reaction.message.guild.id;

    try {
      const { getPrismaClient } = await import('../database/postgresql/client');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId },
        select: { starboardChannelId: true, starboardEmoji: true, starboardThreshold: true },
      });

      if (!guildData?.starboardChannelId) return;

      const starEmoji = guildData.starboardEmoji || '⭐';
      const reactionEmoji = reaction.emoji.name || reaction.emoji.toString();
      if (reactionEmoji !== starEmoji) return;

      const threshold = guildData.starboardThreshold || 3;
      const reactionCount = reaction.count ?? 0;
      const starboardCol = getCollection('starboard');

      if (reactionCount < threshold) {
        // Remove from starboard if below threshold
        const existing = await starboardCol.findOne({ messageId: reaction.message.id, guildId });
        if (existing) {
          const starboardChannel = reaction.message.guild.channels.cache.get(guildData.starboardChannelId) as TextChannel;
          try {
            const sbMsg = await starboardChannel?.messages.fetch(existing.starboardMessageId);
            await sbMsg?.delete();
          } catch { /* Optional */ }
          await starboardCol.deleteOne({ messageId: reaction.message.id, guildId });
        }
      } else {
        await starboardCol.updateOne(
          { messageId: reaction.message.id, guildId },
          { $set: { stars: reactionCount } }
        );
      }
    } catch { /* Optional */ }
  },
};
