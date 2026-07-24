import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class StareCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stare',
      description: 'Stare at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gawk'],
      examples: ['/stare @user', 'p!stare @user'],
    };
    super(options);
  }

  private stareMessages = [
    'stares intensely at',
    'gives a creepy stare to',
    'stares lovingly at',
    'gives a judgmental stare to',
    'stares curiously at',
    'gives a long stare to',
    'stares with wide eyes at',
    'gives a mysterious stare to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.stareMessages[Math.floor(Math.random() * this.stareMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👁️ Stare`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const stareMessage = this.stareMessages[Math.floor(Math.random() * this.stareMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👁️ Stare`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${stareMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default StareCommand;
