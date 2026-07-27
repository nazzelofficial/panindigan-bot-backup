// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/O4HMoXBpEtM3u/giphy.gif',
  'https://media.giphy.com/media/2tigQXJWqbYXu/giphy.gif',
  'https://media.giphy.com/media/bDLMxAeHJkM2A/giphy.gif',
];

export class SmileCommand extends BaseCommand {
  constructor() {
    super({
      name: 'smile',
      description: 'Smile at someone 😊',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['grin'],
      examples: ['/smile @user', 'p!smile @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to smile at').setRequired(false))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user');
      const desc = t
        ? `😊 **${i.user.username}** smiles at **${t.username}**!`
        : `😊 **${i.user.username}** smiles warmly!`;
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

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      const desc = t
        ? `😊 **${m.author.username}** smiles at **${t.username}**!`
        : `😊 **${m.author.username}** smiles warmly!`;
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
export default SmileCommand;
