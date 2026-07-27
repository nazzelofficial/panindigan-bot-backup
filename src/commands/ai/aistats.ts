// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';

export class AiStatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'aistats',
      description: 'View AI usage statistics for this server (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['aiusage', 'ai-stats'],
      examples: ['/aistats', 'p!aistats'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    try {
      const col = getCollection('ai_requests');
      const memoryCol = getCollection('ai_conversations');

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [totalRequests, todayRequests, weekRequests, monthRequests, totalConversations] = await Promise.all([
        col.countDocuments({ guildId: i.guildId }),
        col.countDocuments({ guildId: i.guildId, createdAt: { $gte: today } }),
        col.countDocuments({ guildId: i.guildId, createdAt: { $gte: weekAgo } }),
        col.countDocuments({ guildId: i.guildId, createdAt: { $gte: monthAgo } }),
        memoryCol.countDocuments({ guildId: i.guildId }),
      ]);

      // Get top users
      const topUsers = await col.aggregate([
        { $match: { guildId: i.guildId } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]).toArray();

      // Get provider breakdown
      const providerBreakdown = await col.aggregate([
        { $match: { guildId: i.guildId } },
        { $group: { _id: '$provider', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} AI Usage Statistics`)
        .setColor(COLORS.gold)
        .setThumbnail(i.guild?.iconURL() || null)
        .addFields(
          { name: '📊 Total Requests', value: totalRequests.toLocaleString(), inline: true },
          { name: '📅 Today', value: todayRequests.toLocaleString(), inline: true },
          { name: '📆 This Week', value: weekRequests.toLocaleString(), inline: true },
          { name: '🗓️ This Month', value: monthRequests.toLocaleString(), inline: true },
          { name: '💬 Active Conversations', value: totalConversations.toLocaleString(), inline: true },
          {
            name: '🏆 Top AI Users',
            value: topUsers.length
              ? topUsers.map((u, idx) => `${idx + 1}. <@${u._id}> — **${u.count}** requests`).join('\n')
              : 'No data yet.',
            inline: false,
          },
          {
            name: '🔷 Provider Breakdown',
            value: providerBreakdown.length
              ? providerBreakdown.map(p => `• **${p._id || 'Unknown'}**: ${p.count} requests`).join('\n')
              : 'No data yet.',
            inline: false,
          },
        )
        .setFooter({ text: `Server: ${i.guild?.name}` })
        .setTimestamp();

      await i.editReply({ embeds: [embed] });
    } catch (err: any) {
      await i.editReply({ content: `${EMOJIS.error} Error fetching stats: ${err.message || 'Unknown error'}` });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const col = getCollection('ai_requests');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [total, todayCount] = await Promise.all([
        col.countDocuments({ guildId: m.guildId }),
        col.countDocuments({ guildId: m.guildId, createdAt: { $gte: today } }),
      ]);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} AI Usage Statistics`)
        .setColor(COLORS.gold)
        .addFields(
          { name: '📊 Total Requests', value: total.toLocaleString(), inline: true },
          { name: '📅 Today', value: todayCount.toLocaleString(), inline: true },
        )
        .setTimestamp();
      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply(`${EMOJIS.error} Error: ${err.message || 'Unknown error'}`);
    }
  }
}

export default AiStatsCommand;
