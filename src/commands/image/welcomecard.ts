// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { ImageGenerator } from '../../structures/ImageGenerator.js';

export class WelcomeCardCommand extends BaseCommand {
  constructor() {
    super({ name: 'welcomecard', description: 'Preview the welcome card for a user', category: 'image', premiumTier: 'free', cooldown: 8, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['welcome-card', 'welcomepreview'], examples: ['/welcomecard @user', 'p!welcomecard @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to preview for').setRequired(false)).setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    await i.deferReply();
    try {
      const buf = await ImageGenerator.generateWelcomeCard({
        username: target.username,
        avatarUrl: target.displayAvatarURL({ extension: 'png', size: 256 }),
        guildName: i.guild?.name || 'Server',
        memberCount: i.guild?.memberCount || 0,
        color: '#5865F2',
      });
      await i.editReply({ content: `👋 Welcome card preview for **${target.username}**!`, files: [new AttachmentBuilder(buf, { name: 'welcome.png' })] });
    } catch { await i.editReply({ content: '❌ Failed to generate welcome card.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    try {
      const buf = await ImageGenerator.generateWelcomeCard({ username: target.username, avatarUrl: target.displayAvatarURL({ extension: 'png', size: 256 }), guildName: m.guild?.name || 'Server', memberCount: m.guild?.memberCount || 0, color: '#5865F2' });
      await m.reply({ content: `👋 Welcome preview for ${target.username}!`, files: [new AttachmentBuilder(buf, { name: 'welcome.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default WelcomeCardCommand;
