import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WaveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wave',
      description: 'Wave at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hi', 'hello'],
      examples: ['/wave @user', 'p!wave @user'],
    };
    super(options);
  }

  private waveMessages = [
    'waves at',
    'gives a friendly wave to',
    'waves enthusiastically at',
    'gives a warm wave to',
    'waves excitedly at',
    'gives a cheerful wave to',
    'waves with a smile at',
    'gives a happy wave to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.waveMessages[Math.floor(Math.random() * this.waveMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Wave`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const waveMessage = this.waveMessages[Math.floor(Math.random() * this.waveMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Wave`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${waveMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WaveCommand;
