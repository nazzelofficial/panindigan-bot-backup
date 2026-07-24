import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ConcurrentAiCommand extends BaseCommand {
  constructor() {
    super({ name: 'concurrentai', description: 'Use multiple AI providers at once and compare outputs (Diamond)', category: 'premium', premiumTier: 'diamond', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['multiai', 'aibattle'], examples: ['/concurrentai What is quantum computing?'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prompt = i.options.getString('prompt') || 'Tell me something interesting.';
    await i.deferReply();
    const { aiEngine } = await import('../../structures/AIEngine');
    const providers = aiEngine.getAvailableProviders().slice(0, 2);
    if (providers.length < 2) { await i.editReply({ content: '⚠️ Need at least 2 AI providers configured for concurrent mode.' }); return; }
    const results = await Promise.allSettled(providers.map(p => aiEngine.chat(p, undefined as any, [{ role: 'user', content: prompt }])));
    const embed = new EmbedBuilder().setTitle('🤖 Concurrent AI Comparison').setColor(COLORS.diamond).setDescription(`**Prompt:** ${prompt}`);
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') embed.addFields({ name: `${providers[idx].toUpperCase()}`, value: r.value.content.slice(0, 500), inline: false });
      else embed.addFields({ name: `${providers[idx].toUpperCase()}`, value: '❌ Failed', inline: false });
    });
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!concurrentai <prompt>`'); return; }
    await m.reply('💎 Use `/concurrentai` for the full concurrent AI experience.');
  }
}
export default ConcurrentAiCommand;
