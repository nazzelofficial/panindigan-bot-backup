// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const SCREENSHOT_SERVICES = [
  (url: string) => `https://api.screenshotmachine.com/?url=${encodeURIComponent(url)}&dimension=1280x720&format=jpg&cacheLimit=0`,
  (url: string) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=720`,
  (url: string) => `https://image.thum.io/get/width/1280/crop/720/${url}`,
];

export class ScreenshotCommand extends BaseCommand {
  constructor() {
    super({ name: 'screenshot', description: 'Capture a screenshot of a website (Gold+) 📸', category: 'utility', premiumTier: 'gold', cooldown: 15, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['ss', 'snap', 'capture'], examples: ['/screenshot https://discord.com', 'p!screenshot https://google.com'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('url').setDescription('Website URL to screenshot').setRequired(true))
      .addStringOption(o => o.setName('size').setDescription('Screenshot size').setRequired(false)
        .addChoices(
          { name: '1280×720 (HD)', value: '1280x720' },
          { name: '1920×1080 (Full HD)', value: '1920x1080' },
          { name: '375×812 (Mobile)', value: '375x812' },
        ))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async tryFetch(imageUrl: string): Promise<Buffer | null> {
    try {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const ct = res.headers.get('content-type') || '';
      if (!ct.startsWith('image/')) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  private async run(i: ChatInputCommandInteraction | null, m: Message | null, url: string, size?: string): Promise<void> {
    const send = async (payload: any) => {
      if (i) {
        if (!i.deferred && !i.replied) await i.deferReply();
        await i.editReply(payload);
      } else {
        await m!.reply(payload);
      }
    };

    if (!url) {
      return send({ content: '❌ Please provide a URL to screenshot.' });
    }

    if (!url.startsWith('http')) url = 'https://' + url;

    if (!this.isValidUrl(url)) {
      return send({ content: '❌ Invalid URL. Please provide a valid http/https URL.' });
    }

    if (i && !i.deferred) await i.deferReply();

    const [width, height] = (size || '1280x720').split('x').map(Number);
    const hostname = new URL(url).hostname;

    // Try multiple screenshot services in order
    let imageBuffer: Buffer | null = null;
    let usedService = '';

    const services = [
      { name: 'thum.io', url: `https://image.thum.io/get/width/${width}/crop/${height}/${url}` },
      { name: 'WordPress', url: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${width}&h=${height}` },
      { name: 'ScreenshotMachine', url: `https://api.screenshotmachine.com/?url=${encodeURIComponent(url)}&dimension=${width}x${height}&format=jpg&cacheLimit=0` },
    ];

    for (const svc of services) {
      imageBuffer = await this.tryFetch(svc.url);
      if (imageBuffer && imageBuffer.length > 5000) {
        usedService = svc.name;
        break;
      }
    }

    if (!imageBuffer || imageBuffer.length <= 5000) {
      // Fallback: return embed with link
      const embed = new EmbedBuilder()
        .setTitle(`📸 Screenshot — ${hostname}`)
        .setColor(COLORS.warning)
        .setDescription(`⚠️ Could not fetch screenshot automatically. Click the link to view the site.\n\n🔗 [Open ${hostname}](${url})`)
        .addFields({ name: '🌐 URL', value: url, inline: false })
        .setImage(services[1].url) // embed WordPress preview as fallback
        .setTimestamp();
      return send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📸 Screenshot — ${hostname}`)
      .setColor(COLORS.success)
      .addFields(
        { name: '🌐 URL', value: `[${url}](${url})`, inline: false },
        { name: '📐 Size', value: `${width}×${height}`, inline: true },
        { name: '⚡ Service', value: usedService, inline: true },
      )
      .setImage('attachment://screenshot.jpg')
      .setFooter({ text: 'Gold Premium • Web Screenshot' })
      .setTimestamp();

    await send({ embeds: [embed], files: [new AttachmentBuilder(imageBuffer, { name: 'screenshot.jpg' })] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const url = i.options.getString('url', true);
    const size = i.options.getString('size') || '1280x720';
    await this.run(i, null, url, size);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!screenshot <url>`'); return; }
    await this.run(null, m, args[0], args[1] || '1280x720');
  }
}
export default ScreenshotCommand;
