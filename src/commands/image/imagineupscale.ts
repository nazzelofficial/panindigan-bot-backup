import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import sharp from 'sharp';

export class ImagineUpscaleCommand extends BaseCommand {
  constructor() {
    super({ name: 'imagineupscale', description: 'AI image upscaling — increase resolution up to 4x (Diamond) 🔍', category: 'image', premiumTier: 'diamond', cooldown: 20, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['upscale', 'aiupscale', 'imagine-upscale'], examples: ['/imagineupscale [attach image] 4x', 'p!imagineupscale [attach image]'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addAttachmentOption(o => o.setName('image').setDescription('Image to upscale').setRequired(true))
      .addIntegerOption(o => o.setName('scale').setDescription('Upscale factor (2x or 4x)').setRequired(false)
        .addChoices({ name: '2x', value: 2 }, { name: '4x', value: 4 }))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async upscale(imageBuffer: Buffer, scale: number): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const newWidth = Math.min((metadata.width || 512) * scale, 4096);
    const newHeight = Math.min((metadata.height || 512) * scale, 4096);

    return sharp(imageBuffer)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 })
      .png({ quality: 95 })
      .toBuffer();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const attachment = i.options.getAttachment('image', true);
    const scale = i.options.getInteger('scale') || 2;

    if (!attachment.contentType?.startsWith('image/')) {
      await i.reply({ content: '❌ Please attach a valid image.', ephemeral: true });
      return;
    }

    await i.deferReply();
    try {
      const res = await fetch(attachment.url);
      const buf = Buffer.from(await res.arrayBuffer());
      const upscaled = await this.upscale(buf, scale);

      const meta = await sharp(buf).metadata();
      const outMeta = await sharp(upscaled).metadata();

      const embed = new EmbedBuilder()
        .setTitle(`🔍 Image Upscaled ${scale}x`)
        .setColor(COLORS.diamond)
        .addFields(
          { name: '📐 Original', value: `${meta.width}×${meta.height}`, inline: true },
          { name: '📐 Upscaled', value: `${outMeta.width}×${outMeta.height}`, inline: true },
          { name: '🔍 Scale', value: `${scale}x`, inline: true },
        )
        .setImage('attachment://upscaled.png')
        .setFooter({ text: 'Diamond • AI Upscale • Lanczos3 algorithm' })
        .setTimestamp();

      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(upscaled, { name: 'upscaled.png' })] });
    } catch (e: any) {
      await i.editReply({ content: `❌ Failed to upscale: ${e.message}` });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const attachment = m.attachments.first();
    if (!attachment) { await m.reply('❌ Please attach an image to upscale.'); return; }
    const scale = parseInt(args.find(a => a === '2' || a === '4') || '2') as 2 | 4;
    try {
      const res = await fetch(attachment.url);
      const buf = Buffer.from(await res.arrayBuffer());
      const upscaled = await this.upscale(buf, scale);
      await m.reply({ files: [new AttachmentBuilder(upscaled, { name: 'upscaled.png' })] });
    } catch (e: any) {
      await m.reply(`❌ Failed: ${e.message}`);
    }
  }
}
export default ImagineUpscaleCommand;
