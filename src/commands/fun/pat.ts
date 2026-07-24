import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PatCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pat',
      description: 'Pat someone on the head',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['headpat', 'pet'],
      examples: ['/pat @user', 'p!pat @user'],
    };
    super(options);
  }

  private patMessages = [
    'gives head pats to',
    'gives gentle pats to',
    'pets',
    'gives affectionate pats to',
    'gives comforting head pats to',
    'gives warm pats to',
    'gives soft pats to',
    'gives loving pats to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.patMessages[Math.floor(Math.random() * this.patMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🥰 Pat`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/tuI6sxI1I6m9m/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const patMessage = this.patMessages[Math.floor(Math.random() * this.patMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🥰 Pat`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${patMessage} ${user}`)
      .setImage('https://media.giphy.com/media/tuI6sxI1I6m9m/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PatCommand;
