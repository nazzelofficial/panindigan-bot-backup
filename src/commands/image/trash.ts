import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { createCanvas, loadImage } from 'canvas';

export class TrashCommand extends BaseCommand {
  constructor() {
    super({ name: 'trash', description: 'Put a user\'s avatar in a trash can', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['garbage', 'rubbish'], examples: ['/trash @user', 'p!trash @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)).setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    await i.deferReply();
    try {
      const canvas = createCanvas(300, 300);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 300, 300);
      // Draw trash can body
      ctx.fillStyle = '#555555';
      ctx.fillRect(75, 120, 150, 160);
      ctx.fillStyle = '#444444';
      ctx.fillRect(60, 100, 180, 25);
      ctx.fillRect(110, 75, 80, 30);
      const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 64 }));
      ctx.save();
      ctx.rotate(-0.2);
      ctx.drawImage(avatar, 90, 100, 80, 80);
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(75, 120, 150, 160);
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'trash.png' });
      const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🗑️ **${target.username}** belongs in the trash!`).setImage('attachment://trash.png');
      await i.editReply({ embeds: [embed], files: [attachment] });
    } catch { await i.editReply({ content: '❌ Failed to generate image.' }); }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    try {
      const canvas = createCanvas(300, 300);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#555555';
      ctx.fillRect(75, 120, 150, 160);
      ctx.fillStyle = '#444444';
      ctx.fillRect(60, 100, 180, 25);
      ctx.fillRect(110, 75, 80, 30);
      const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 64 }));
      ctx.drawImage(avatar, 110, 95, 80, 80);
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'trash.png' });
      await m.reply({ content: `🗑️ ${target.username} belongs in the trash!`, files: [attachment] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default TrashCommand;
