// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/s2qXK8wAvkHTO/giphy.gif',
  'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif',
  'https://media.giphy.com/media/LSNqpYqGRqwrS/giphy.gif',
];

export class CelebrateCommand extends BaseCommand {
  constructor() {
    super({
      name: 'celebrate',
      description: 'Celebrate with someone! 🎊',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['congrats', 'congrat'],
      examples: ['/celebrate @user', 'p!celebrate @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to celebrate with').setRequired(false))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user');
      const desc = t
        ? `🎊 **${i.user.username}** celebrates with **${t.username}**! Congratulations! 🎉`
        : `🎊 **${i.user.username}** is celebrating! Let's gooo! 🎉`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.gold)
        .setFooter({ text: 'Panindigan Social' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      const desc = t
        ? `🎊 **${m.author.username}** celebrates with **${t.username}**! Congratulations! 🎉`
        : `🎊 **${m.author.username}** is celebrating! Let's gooo! 🎉`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.gold)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default CelebrateCommand;
