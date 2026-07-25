import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class AiproviderstatsCommand extends BaseCommand {
  constructor() {
    super({ name: 'aiproviderstats', description: 'Show per-provider AI request statistics', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aistats'], examples: ['p!aiproviderstats'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    try {
      const db = await getMongoClient();
      const pipeline = [
        { $group: { _id: '$provider', requests: { $sum: 1 }, tokens: { $sum: '$tokensUsed' }, avgLatency: { $avg: '$latencyMs' } } },
        { $sort: { requests: -1 } }
      ];
      const stats = await db.collection('ai_requests').aggregate(pipeline).toArray();
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📊 AI Provider Stats')
        .setDescription(stats.length ? stats.map(s =>
          `**${s._id ?? 'unknown'}**: ${s.requests.toLocaleString()} reqs | ${(s.tokens ?? 0).toLocaleString()} tokens | ${Math.round(s.avgLatency ?? 0)}ms avg`
        ).join('\n') : 'No data yet.');
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default AiproviderstatsCommand;
