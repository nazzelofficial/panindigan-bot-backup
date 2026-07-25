import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ScreenshotCommand extends BaseCommand {
  constructor() {
    super({ name: 'screenshot', description: 'Get a screenshot of a website', category: 'utility', premiumTier: 'gold', cooldown: 10, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['ss', 'snap'], examples: ['/screenshot https://discord.com', 'p!screenshot https://google.com'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, url: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!url) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a URL.'));
    try { new URL(url); } catch { return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid URL.')); }
    // Use a public screenshot service
    const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&full_page=false&format=jpg`;
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📸 Website Screenshot')
      .setDescription(`**URL:** ${url}\n\n💡 **Note:** For full screenshot functionality, set up a ScreenshotOne API key.\n\nPreview link: [Open site](${url})`)
      .setImage(`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=630`);
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('url', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default ScreenshotCommand;
