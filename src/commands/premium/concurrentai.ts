// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class ConcurrentAiCommand extends BaseCommand {
  constructor() {
    super({ name: 'concurrentai', description: 'Compare multiple AI providers side-by-side with one prompt (Diamond) 🤖', category: 'premium', premiumTier: 'diamond', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['multiai', 'aibattle', 'aicompare'], examples: ['/concurrentai What is quantum computing?', 'p!concurrentai Explain black holes'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Prompt to send to all AI providers').setRequired(true).setMaxLength(1000))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async runConcurrent(prompt: string, send: (c: any) => Promise<any>): Promise<void> {
    const { aiEngine } = await import('../../structures/AIEngine.js');
    const providers = aiEngine.getAvailableProviders().slice(0, 3);

    if (providers.length < 2) {
      await send({
        embeds: [new EmbedBuilder()
          .setTitle('🤖 Concurrent AI')
          .setColor(COLORS.warning)
          .setDescription('⚠️ At least 2 AI providers must be configured for concurrent comparison.\n\nAvailable providers: ' + (providers.join(', ') || 'none'))],
      });
      return;
    }

    const results = await Promise.allSettled(
      providers.map(async p => {
        const start = Date.now();
        const res = await aiEngine.chat(p, undefined as any, [{ role: 'user', content: prompt }]);
        return { provider: p, content: res.content, ms: Date.now() - start };
      })
    );

    const embed = new EmbedBuilder()
      .setTitle('🤖 Concurrent AI Comparison')
      .setColor(COLORS.diamond)
      .setDescription(`**Prompt:** ${prompt}`)
      .setFooter({ text: `Diamond • ${providers.length} providers compared` })
      .setTimestamp();

    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        const { provider, content, ms } = r.value;
        embed.addFields({
          name: `${provider.toUpperCase()} (${ms}ms)`,
          value: content.slice(0, 700) + (content.length > 700 ? '...' : ''),
          inline: false,
        });
      } else {
        embed.addFields({
          name: '❌ Provider Failed',
          value: `Error: ${(r.reason as Error)?.message || 'Unknown'}`,
          inline: false,
        });
      }
    });

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prompt = i.options.getString('prompt', true);
    await i.deferReply();
    await this.runConcurrent(prompt, (c) => i.editReply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!concurrentai <prompt>`\nExample: `p!concurrentai What is AI?`'); return; }
    const msg = await m.reply('⏳ Querying multiple AI providers concurrently...');
    await this.runConcurrent(args.join(' '), (c) => msg.edit(c));
  }
}
export default ConcurrentAiCommand;
