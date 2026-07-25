import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class CompatibilityHistoryCommand extends BaseCommand {
  constructor() {
    super({ name: 'compatibilityhistory', description: 'View historical compatibility scores and trends with your partner 📈', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['compathistory', 'lovescores'], examples: ['/compatibilityhistory', 'p!compatibilityhistory @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Compare with specific user').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private calcScore(id1: string, id2: string, offset: number = 0): number {
    const combined = (BigInt(id1) + BigInt(id2) + BigInt(offset)).toString();
    let hash = 0;
    for (const c of combined) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return Math.abs(hash % 101);
  }

  private bar(pct: number): string {
    const filled = Math.round(pct / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  }

  private async handle(userId: string, guildId: string, partnerId: string | null, send: (c: any) => Promise<any>, client: any): Promise<void> {
    if (!partnerId) { await send({ content: '❌ Mention a user or have a couple status to view history.', ephemeral: true }); return; }

    let u1Name = userId, u2Name = partnerId;
    try { u1Name = (await client.users.fetch(userId)).username; } catch { /* ignored */ }
    try { u2Name = (await client.users.fetch(partnerId)).username; } catch { /* ignored */ }

    // Generate fake-but-deterministic historical scores (7 data points)
    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const history = Array.from({ length: 7 }, (_, i) => {
      const weekOffset = 7 - i;
      const score = this.calcScore(userId, partnerId, weekOffset);
      const weekDate = new Date(now - weekOffset * WEEK);
      return { week: weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score };
    });

    const avgScore = Math.round(history.reduce((s, h) => s + h.score, 0) / history.length);
    const trend = history[history.length - 1].score - history[0].score;
    const trendEmoji = trend > 5 ? '📈' : trend < -5 ? '📉' : '📊';

    const lines = history.map(h => `\`${h.week}\` ${this.bar(h.score)} **${h.score}%**`);

    const embed = new EmbedBuilder()
      .setTitle(`💕 Compatibility History — ${u1Name} & ${u2Name}`)
      .setDescription(lines.join('\n'))
      .setColor(0xff69b4)
      .addFields(
        { name: '📊 Average Score', value: `${avgScore}%`, inline: true },
        { name: `${trendEmoji} Trend`, value: trend > 0 ? `+${trend}% improving!` : trend < 0 ? `${trend}% declining` : 'Stable', inline: true },
        { name: '🏆 Best Week', value: `${Math.max(...history.map(h => h.score))}%`, inline: true },
      )
      .setFooter({ text: 'Compatibility scores are for entertainment purposes only 💕' })
      .setTimestamp();

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user');
    await this.handle(i.user.id, i.guildId!, target?.id || null, (c) => i.reply(c), i.client);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first();
    await this.handle(m.author.id, m.guildId!, target?.id || null, (c) => m.reply(c), m.client);
  }
}
export default CompatibilityHistoryCommand;
