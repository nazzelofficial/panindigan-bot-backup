import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class AiusageCommand extends BaseCommand {
  constructor() {
    super({ name: 'aiusage', description: 'Show AI usage statistics per provider', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aiuse'], examples: ['p!aiusage'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    try {
      const db = await getMongoClient();
      const results = await db.collection('ai_requests').aggregate([
        { $group: { _id: '$provider', requests: { $sum: 1 }, tokens: { $sum: '$tokensUsed' } } },
        { $sort: { requests: -1 } }
      ]).toArray();
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🤖 AI Usage Statistics')
        .setDescription(results.length ? results.map(r =>
          `**${r._id ?? 'unknown'}**: ${r.requests.toLocaleString()} requests, ${(r.tokens ?? 0).toLocaleString()} tokens`
        ).join('\n') : 'No AI request data yet.');
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default AiusageCommand;
