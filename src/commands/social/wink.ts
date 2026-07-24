import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/SkGEhWMVlEpLi/giphy.gif',
  'https://media.giphy.com/media/3HEBclMqQN9UxMqVBp/giphy.gif',
  'https://media.giphy.com/media/z5iCVPqTRjXK0/giphy.gif',
];

export class WinkCommand extends BaseCommand {
  constructor() {
    super({
      name: 'wink',
      description: 'Wink at someone 😉',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['winkat'],
      examples: ['/wink @user', 'p!wink @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to wink at').setRequired(false))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user');
      const desc = t
        ? `😉 **${i.user.username}** winks at **${t.username}**!`
        : `😉 **${i.user.username}** winks!`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.default)
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
        ? `😉 **${m.author.username}** winks at **${t.username}**!`
        : `😉 **${m.author.username}** winks!`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default WinkCommand;
