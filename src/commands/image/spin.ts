// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';

export class SpinCommand extends BaseCommand {
  constructor() {
    super({ name: 'spin', description: 'Make a user\'s avatar spin', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['rotate', 'spinning'], examples: ['/spin @user', 'p!spin @user 45'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
      .addIntegerOption(o => o.setName('degrees').setDescription('Rotation degrees (0-360)').setRequired(false).setMinValue(0).setMaxValue(360))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async generate(avatarUrl: string, degrees: number): Promise<Buffer> {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    const avatar = await loadImage(avatarUrl);
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(avatar, -128, -128, 256, 256);
    ctx.restore();
    return canvas.toBuffer();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    const degrees = i.options.getInteger('degrees') ?? 45;
    await i.deferReply();
    try {
      const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 256 }), degrees);
      const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🌀 **${target.username}** rotated ${degrees}°`).setImage('attachment://spin.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'spin.png' })] });
    } catch { await i.editReply({ content: '❌ Failed.' }); }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    const degrees = parseInt(args.find(a => /^\d+$/.test(a)) || '90') || 90;
    try {
      const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 256 }), degrees);
      await m.reply({ content: `🌀 ${degrees}°`, files: [new AttachmentBuilder(buf, { name: 'spin.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default SpinCommand;
