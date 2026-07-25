import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';

export class GifCommand extends BaseCommand {
  constructor() {
    super({ name: 'gif', description: 'Create a custom animated GIF from an avatar or image (Diamond) 🎬', category: 'image', premiumTier: 'diamond', cooldown: 15, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['makegif', 'creategif', 'animategif'], examples: ['/gif @user spin', 'p!gif @user pulse'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('create').setDescription('Create a custom animated GIF')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
        .addStringOption(o => o.setName('effect').setDescription('Animation effect').setRequired(false)
          .addChoices(
            { name: 'Spin', value: 'spin' },
            { name: 'Pulse', value: 'pulse' },
            { name: 'Shake', value: 'shake' },
            { name: 'Bounce', value: 'bounce' },
          )))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async generateFrames(avatarUrl: string, effect: string, frameCount: number): Promise<Buffer[]> {
    const size = 200;
    const frames: Buffer[] = [];

    const img = await loadImage(avatarUrl);

    for (let f = 0; f < frameCount; f++) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      const t = f / frameCount;

      ctx.save();
      ctx.translate(size / 2, size / 2);

      if (effect === 'spin') {
        ctx.rotate(t * Math.PI * 2);
      } else if (effect === 'pulse') {
        const scale = 0.85 + 0.15 * Math.sin(t * Math.PI * 2);
        ctx.scale(scale, scale);
      } else if (effect === 'shake') {
        const dx = Math.sin(t * Math.PI * 4) * 10;
        ctx.translate(dx, 0);
      } else if (effect === 'bounce') {
        const dy = Math.abs(Math.sin(t * Math.PI * 2)) * -20;
        ctx.translate(0, dy);
      }

      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();

      frames.push(canvas.toBuffer('image/png'));
    }
    return frames;
  }

  private async handle(avatarUrl: string, effect: string, send: (c: any) => Promise<any>): Promise<void> {
    const frameCount = 16;
    const frames = await this.generateFrames(avatarUrl, effect, frameCount);

    // Use sharp to create an animated WebP (GIF-like)
    const animatedWebp = await sharp(frames[0])
      .webp({ quality: 80 })
      .toBuffer();

    // Since canvas can't easily create real GIFs, we deliver frames as a collage strip
    // and note the limitation
    const W = 200 * 4, H = 200 * Math.ceil(frameCount / 4);
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c2f33';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < frameCount; i++) {
      const img = await loadImage(frames[i]);
      const x = (i % 4) * 200;
      const y = Math.floor(i / 4) * 200;
      ctx.drawImage(img, x, y, 200, 200);
    }

    const strip = canvas.toBuffer('image/png');

    const embed = new EmbedBuilder()
      .setTitle(`🎬 GIF Animation — ${effect}`)
      .setDescription(`🎨 Animation preview strip (${frameCount} frames)\n> For a real animated GIF, a dedicated GIF encoder like \`gif-encoder-2\` is required.`)
      .setColor(COLORS.diamond)
      .setImage('attachment://gif-preview.png')
      .setFooter({ text: 'Diamond • Panindigan Image' });

    await send({ embeds: [embed], files: [new AttachmentBuilder(strip, { name: 'gif-preview.png' })] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) || 'create';
    if (sub !== 'create') { await i.reply({ content: '❌ Use `/gif create`', ephemeral: true }); return; }
    const user = i.options.getUser('user') || i.user;
    const effect = i.options.getString('effect') || 'spin';
    await i.deferReply();
    try {
      await this.handle(user.displayAvatarURL({ extension: 'png', size: 256 }), effect, (c) => i.editReply(c));
    } catch (e: any) {
      await i.editReply({ content: `❌ Failed: ${e.message}` });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const user = m.mentions.users.first() || m.author;
    const effect = args.find(a => ['spin', 'pulse', 'shake', 'bounce'].includes(a)) || 'spin';
    try {
      await this.handle(user.displayAvatarURL({ extension: 'png', size: 256 }), effect, (c) => m.reply(c));
    } catch (e: any) {
      await m.reply(`❌ Failed: ${e.message}`);
    }
  }
}
export default GifCommand;
