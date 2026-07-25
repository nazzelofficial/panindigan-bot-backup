import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class PdfCommand extends BaseCommand {
  constructor() {
    super({ name: 'pdf', description: 'Convert or get info about a PDF file', category: 'utility', premiumTier: 'gold', cooldown: 10, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pdfinfo'], examples: ['/pdf [attach a PDF]', 'p!pdf [attach a PDF]'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const attachment = i?.options.getAttachment('file') ?? m?.attachments.first();
    if (!attachment) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Please attach a PDF file.'));
    if (!attachment.name?.toLowerCase().endsWith('.pdf')) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Please attach a `.pdf` file.'));
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📄 PDF Information')
      .addFields(
        { name: '📁 Filename', value: attachment.name, inline: true },
        { name: '📦 Size', value: `${(attachment.size / 1024).toFixed(1)} KB`, inline: true },
        { name: '🔗 URL', value: `[Download](${attachment.url})`, inline: true },
        { name: '💡 PDF Processing', value: 'To convert or extract text from PDFs, install `pdf-parse` and set up the PDF processing pipeline.', inline: false }
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default PdfCommand;
