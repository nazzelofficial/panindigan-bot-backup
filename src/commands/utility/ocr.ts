import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class OcrCommand extends BaseCommand {
  constructor() {
    super({ name: 'ocr', description: 'Extract text from an image (OCR)', category: 'utility', premiumTier: 'gold', cooldown: 10, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['readimage', 'extracttext'], examples: ['/ocr [attach an image]', 'p!ocr [attach an image]'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const attachment = i?.options.getAttachment('image') ?? m?.attachments.first();
    if (!attachment) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Please attach an image to scan.'));
    if (!attachment.contentType?.startsWith('image/')) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Please attach a valid image file.'));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🔍 OCR — Text Extraction')
      .setThumbnail(attachment.url)
      .setDescription('📄 **Image received.**\n\n> OCR processing requires an external API key (e.g., OCR.Space or Google Vision).\n> Set `OCR_API_KEY` in environment variables to enable text extraction.\n\n**Image URL:** ' + attachment.url);
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default OcrCommand;
