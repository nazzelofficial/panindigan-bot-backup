import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getCollection } from '../../database/mongodb/client';

export class StarboardLeaderboardCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-leaderboard', description: 'Top starred message authors in this server', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sb-lb', 'starlb', 'starbug'], examples: ['/starboard-leaderboard'] } as CommandOptions);
  }

  private async getLeaderboard(guildId: string): Promise<EmbedBuilder | string> {
    const col = getCollection('starboard');
    const pipeline = [
      { $match: { guildId } },
      { $group: { _id: '$authorId', totalStars: { $sum: '$starCount' }, messages: { $sum: 1 } } },
      { $sort: { totalStars: -1 } },
      { $limit: 10 },
    ];
    const results = await col.aggregate(pipeline).toArray() as any[];
    if (!results.length) return '📭 No starboard data yet.';
    const medals = ['🥇', '🥈', '🥉'];
    const embed = new EmbedBuilder().setTitle('⭐ Starboard Leaderboard').setColor(COLORS.gold)
      .setDescription(results.map((r, i) => `${medals[i] || `**${i + 1}.**`} <@${r._id}> — **${r.totalStars}** ⭐ across ${r.messages} message(s)`).join('\n'))
      .setTimestamp();
    return embed;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const result = await this.getLeaderboard(i.guildId!);
    if (typeof result === 'string') await i.reply({ content: result });
    else await i.reply({ embeds: [result] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const result = await this.getLeaderboard(m.guildId!);
    if (typeof result === 'string') await m.reply(result);
    else await m.reply({ embeds: [result] });
  }
}
export default StarboardLeaderboardCommand;
