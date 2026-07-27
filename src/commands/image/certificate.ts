// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ImageGenerator } from '../../structures/ImageGenerator.js';

export class CertificateCommand extends BaseCommand {
  constructor() {
    super({ name: 'certificate', description: 'Generate a funny certificate for a user', category: 'image', premiumTier: 'free', cooldown: 8, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['cert', 'award'], examples: ['/certificate @user "Best Memer"', 'p!certificate @user Best Memer'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Recipient').setRequired(false))
      .addStringOption(o => o.setName('title').setDescription('Certificate title').setRequired(false))
      .addStringOption(o => o.setName('description').setDescription('Achievement description').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    const title = i.options.getString('title') || 'Official Discord Legend';
    const desc = i.options.getString('description') || `For outstanding contributions to the server`;
    await i.deferReply();
    try {
      const buf = await ImageGenerator.generateCertificate(target.displayName, title, desc);
      const attachment = new AttachmentBuilder(buf, { name: 'certificate.png' });
      await i.editReply({ content: `🏆 Certificate awarded to **${target.username}**!`, files: [attachment] });
    } catch { await i.editReply({ content: '❌ Failed to generate certificate.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    const title = _args.slice(1).join(' ') || 'Official Discord Legend';
    try {
      const buf = await ImageGenerator.generateCertificate(target.displayName, title);
      await m.reply({ content: `🏆 Certificate awarded to ${target.username}!`, files: [new AttachmentBuilder(buf, { name: 'certificate.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default CertificateCommand;
