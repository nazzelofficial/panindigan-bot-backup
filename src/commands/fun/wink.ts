import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WinkCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wink',
      description: 'Wink at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['winky'],
      examples: ['/wink @user', 'p!wink @user'],
    };
    super(options);
  }

  private winkMessages = [
    'winks at',
    'gives a playful wink to',
    'winks flirtatiously at',
    'gives a cheeky wink to',
    'winks suggestively at',
    'gives a mysterious wink to',
    'winks with a smile at',
    'gives a cute wink to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.winkMessages[Math.floor(Math.random() * this.winkMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😉 Wink`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const winkMessage = this.winkMessages[Math.floor(Math.random() * this.winkMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😉 Wink`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${winkMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WinkCommand;
