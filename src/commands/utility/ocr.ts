import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, AttachmentOption } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class OcrCommand extends BaseCommand {
  constructor() {
    super({ name: 'ocr', description: 'Extract text from an image using OCR (Gold+)', category: 'utility', premiumTier: 'gold', cooldown: 10, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['readimage', 'extracttext'], examples: ['/ocr [attach an image]', 'p!ocr [attach an image]'] } as CommandOptions);
  }

  private async extractText(imageUrl: string): Promise<string | null> {
    // OCR.space free endpoint — no key required for basic usage
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: process.env.OCR_API_KEY || 'helloworld' },
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json() as any;
    if (data.IsErroredOnProcessing) return null;

    const parsedResults = data.ParsedResults;
    if (!parsedResults?.length) return null;

    return parsedResults.map((r: any) => r.ParsedText?.trim()).filter(Boolean).join('\n') || null;
  }

  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (payload: any) => {
      if (i) {
        if (!i.deferred && !i.replied) await i.deferReply();
        await i.editReply(payload);
      } else {
        await m!.reply(payload);
      }
    };

    const attachment = i?.options.getAttachment('image') ?? m?.attachments.first();
    if (!attachment) {
      return send({ content: '❌ Please attach an image to scan.' });
    }
    if (!attachment.contentType?.startsWith('image/')) {
      return send({ content: '❌ Please attach a valid image file (PNG, JPG, etc.).' });
    }

    if (i && !i.deferred) await i.deferReply();

    try {
      const text = await this.extractText(attachment.url);

      const embed = new EmbedBuilder()
        .setTitle('🔍 OCR — Text Extraction')
        .setThumbnail(attachment.url)
        .setTimestamp();

      if (text && text.length > 0) {
        // Truncate if too long
        const truncated = text.length > 3500 ? text.slice(0, 3500) + '\n...(truncated)' : text;
        embed.setColor(COLORS.success)
          .setDescription(`**Extracted Text:**\n\`\`\`\n${truncated}\n\`\`\``)
          .setFooter({ text: `${text.length} characters extracted` });
      } else {
        embed.setColor(COLORS.warning)
          .setDescription('⚠️ No text was detected in this image. Try with a clearer or higher-resolution image containing visible text.')
          .setFooter({ text: 'OCR powered by OCR.space' });
      }

      await send({ embeds: [embed] });
    } catch (e: any) {
      await send({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(`❌ OCR failed: ${e.message || 'Unknown error'}`)
          .setThumbnail(attachment.url)],
      });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default OcrCommand;
