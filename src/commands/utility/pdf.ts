// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class PdfCommand extends BaseCommand {
  constructor() {
    super({ name: 'pdf', description: 'Extract text and info from a PDF file (Gold+) 📄', category: 'utility', premiumTier: 'gold', cooldown: 15, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pdfinfo', 'pdftext', 'readpdf'], examples: ['/pdf [attach a PDF]', 'p!pdf [attach a PDF]'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addAttachmentOption(o => o.setName('file').setDescription('PDF file to process').setRequired(true))
      .addStringOption(o => o.setName('mode').setDescription('What to do').setRequired(false)
        .addChoices(
          { name: 'Extract text', value: 'text' },
          { name: 'File info only', value: 'info' },
        ))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async parsePdf(pdfBuffer: Buffer): Promise<{ text: string; numPages: number } | null> {
    try {
      const pdfParse = await import('pdf-parse').catch(() => null) as any;
      if (!pdfParse) return null;
      const data = await pdfParse.default(pdfBuffer);
      return { text: data.text, numPages: data.numpages };
    } catch {
      return null;
    }
  }

  private async run(i: ChatInputCommandInteraction | null, m: Message | null, mode?: string): Promise<void> {
    const send = async (payload: any) => {
      if (i) {
        if (!i.deferred && !i.replied) await i.deferReply();
        await i.editReply(payload);
      } else {
        await m!.reply(payload);
      }
    };

    const attachment = (i?.options.getAttachment('file')) ?? m?.attachments.first();
    if (!attachment) return send({ content: '❌ Please attach a PDF file.' });
    if (!attachment.name?.toLowerCase().endsWith('.pdf')) return send({ content: '❌ Please attach a `.pdf` file.' });
    if (attachment.size > 10 * 1024 * 1024) return send({ content: '❌ PDF must be under 10MB.' });

    if (i && !i.deferred) await i.deferReply();

    const resolvedMode = mode || i?.options.getString('mode') || 'text';

    const embed = new EmbedBuilder()
      .setTitle('📄 PDF Processor')
      .setColor(COLORS.info)
      .setTimestamp();

    if (resolvedMode === 'info') {
      embed.addFields(
        { name: '📁 Filename', value: attachment.name, inline: true },
        { name: '📦 File Size', value: `${(attachment.size / 1024).toFixed(1)} KB`, inline: true },
        { name: '🔗 URL', value: `[Download](${attachment.url})`, inline: true },
      );
      return send({ embeds: [embed] });
    }

    // Download and parse PDF
    try {
      const res = await fetch(attachment.url);
      const buf = Buffer.from(await res.arrayBuffer());

      const result = await this.parsePdf(buf);

      if (!result) {
        // pdf-parse not available — basic info only
        embed.setColor(COLORS.warning)
          .setDescription('⚠️ PDF text extraction is not available (requires `pdf-parse` package). File info shown below.')
          .addFields(
            { name: '📁 Filename', value: attachment.name, inline: true },
            { name: '📦 File Size', value: `${(attachment.size / 1024).toFixed(1)} KB`, inline: true },
            { name: '🔗 URL', value: `[Download](${attachment.url})`, inline: true },
          );
        return send({ embeds: [embed] });
      }

      const { text, numPages } = result;
      const cleanText = text.replace(/\s+/g, ' ').trim();
      const truncated = cleanText.length > 3000 ? cleanText.slice(0, 3000) + '\n...(truncated)' : cleanText;

      embed.setColor(COLORS.success)
        .setDescription(truncated ? `**Extracted Text:**\n\`\`\`\n${truncated}\n\`\`\`` : '⚠️ No text content found in this PDF.')
        .addFields(
          { name: '📁 Filename', value: attachment.name, inline: true },
          { name: '📄 Pages', value: `${numPages}`, inline: true },
          { name: '📝 Characters', value: `${cleanText.length.toLocaleString()}`, inline: true },
          { name: '📦 File Size', value: `${(attachment.size / 1024).toFixed(1)} KB`, inline: true },
        );

      // If text is long, also send as text file
      if (cleanText.length > 2000) {
        const txtBuf = Buffer.from(cleanText, 'utf8');
        return send({
          embeds: [embed],
          files: [new AttachmentBuilder(txtBuf, { name: `${attachment.name.replace('.pdf', '')}-text.txt` })],
        });
      }

      await send({ embeds: [embed] });
    } catch (e: any) {
      await send({ content: `❌ Failed to process PDF: ${e.message || 'Unknown error'}` });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const mode = _args.includes('info') ? 'info' : 'text';
    await this.run(null, m, mode);
  }
}
export default PdfCommand;
