import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
  'https://media.giphy.com/media/l4pTsNgkamxfk2ZLq/giphy.gif',
  'https://media.giphy.com/media/26gJAMkOxAW5VNDDO/giphy.gif',
];

export class CheerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'cheer',
      description: 'Cheer someone on! 📣',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cheers', 'hype'],
      examples: ['/cheer @user', 'p!cheer @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to cheer for').setRequired(false))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user');
      const desc = t
        ? `📣 **${i.user.username}** cheers for **${t.username}**! You can do it! 🎉`
        : `📣 **${i.user.username}** cheers everyone on! 🎉`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.success)
        .setFooter({ text: 'Panindigan Social' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      const desc = t
        ? `📣 **${m.author.username}** cheers for **${t.username}**! You can do it! 🎉`
        : `📣 **${m.author.username}** cheers everyone on! 🎉`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.success)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default CheerCommand;
