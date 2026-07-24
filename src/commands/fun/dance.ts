import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dance',
      description: 'Dance with someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boogie', 'party'],
      examples: ['/dance @user', 'p!dance @user'],
    };
    super(options);
  }

  private danceMessages = [
    'dances with',
    'gives a dance to',
    'dances enthusiastically with',
    'gives a groovy dance to',
    'dances excitedly with',
    'gives a fun dance to',
    'dances with joy with',
    'gives a celebratory dance to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.danceMessages[Math.floor(Math.random() * this.danceMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💃 Dance`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const danceMessage = this.danceMessages[Math.floor(Math.random() * this.danceMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💃 Dance`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${danceMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DanceCommand;
