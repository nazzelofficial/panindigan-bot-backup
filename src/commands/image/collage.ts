// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';

export class CollageCommand extends BaseCommand {
  constructor() {
    super({ name: 'collage', description: 'Create an avatar collage of multiple users', category: 'image', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['avatar-collage', 'members-grid'], examples: ['/collage @user1 @user2 @user3'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
      .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(false))
      .addUserOption(o => o.setName('user3').setDescription('Third user').setRequired(false))
      .addUserOption(o => o.setName('user4').setDescription('Fourth user').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const users = [i.options.getUser('user1')!, i.options.getUser('user2'), i.options.getUser('user3'), i.options.getUser('user4')].filter(Boolean) as any[];
    await i.deferReply();
    try {
      const cols = Math.ceil(Math.sqrt(users.length));
      const rows = Math.ceil(users.length / cols);
      const size = 128;
      const canvas = createCanvas(cols * size, rows * size);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#2c2f33';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let idx = 0; idx < users.length; idx++) {
        const avatar = await loadImage(users[idx].displayAvatarURL({ extension: 'png', size }));
        const x = (idx % cols) * size;
        const y = Math.floor(idx / cols) * size;
        ctx.drawImage(avatar, x, y, size, size);
      }
      const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🖼️ Collage of ${users.length} members`).setImage('attachment://collage.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(canvas.toBuffer(), { name: 'collage.png' })] });
    } catch { await i.editReply({ content: '❌ Failed to create collage.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const users = m.mentions.users.first(4);
    if (!users.length) { await m.reply('❌ Mention at least 1 user.'); return; }
    try {
      const size = 128;
      const canvas = createCanvas(size * users.length, size);
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < users.length; i++) {
        const avatar = await loadImage(users[i].displayAvatarURL({ extension: 'png', size }));
        ctx.drawImage(avatar, i * size, 0, size, size);
      }
      await m.reply({ files: [new AttachmentBuilder(canvas.toBuffer(), { name: 'collage.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default CollageCommand;
