// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

export class CaptionCommand extends BaseCommand {
  constructor() {
    super({ name: 'caption', description: 'Add a caption to a user\'s avatar', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['addcaption', 'captionify'], examples: ['/caption @user "Hello World"', 'p!caption @user Hello World'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Caption text').setRequired(true).setMaxLength(80))
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async generate(avatarUrl: string, text: string): Promise<Buffer> {
    const canvas = createCanvas(512, 560);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 560);
    const avatar = await loadImage(avatarUrl);
    ctx.drawImage(avatar, 0, 0, 512, 512);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 510, 512, 50);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text.slice(0, 40), 256, 543);
    return canvas.toBuffer();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const text = i.options.getString('text', true);
    const target = i.options.getUser('user') || i.user;
    await i.deferReply();
    try {
      const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 512 }), text);
      const embed = new EmbedBuilder().setColor(COLORS.default).setImage('attachment://caption.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'caption.png' })] });
    } catch { await i.editReply({ content: '❌ Failed.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    const text = _args.filter(a => !a.startsWith('<@')).join(' ') || 'Caption';
    try {
      const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 512 }), text);
      await m.reply({ files: [new AttachmentBuilder(buf, { name: 'caption.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default CaptionCommand;
