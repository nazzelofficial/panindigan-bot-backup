// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class ShortenCommand extends BaseCommand {
  constructor() {
    super({ name: 'shorten', description: 'Shorten a URL using TinyURL', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['short', 'tinyurl'], examples: ['/shorten https://example.com/very-long-url', 'p!shorten https://example.com'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, url: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!url) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a URL to shorten.'));
    try { new URL(url); } catch { return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid URL provided.')); }
    try {
      const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(8000) });
      const shortened = await resp.text();
      if (!shortened.startsWith('https://')) throw new Error('TinyURL returned invalid response.');
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🔗 URL Shortened')
        .addFields({ name: 'Original', value: url.slice(0, 200), inline: false }, { name: 'Short URL', value: shortened, inline: false }));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Failed to shorten URL: ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('url', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default ShortenCommand;
