import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HighFiveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'highfive',
      description: 'Give someone a high five',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hi5'],
      examples: ['/highfive @user', 'p!highfive @user'],
    };
    super(options);
  }

  private highFiveMessages = [
    'gives an epic high five to',
    'high fives',
    'gives a high five to',
    'gives a celebratory high five to',
    'high fives enthusiastically with',
    'gives a solid high five to',
    'gives a high five of approval to',
    'gives a high five of victory to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.highFiveMessages[Math.floor(Math.random() * this.highFiveMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ✋ High Five`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const highFiveMessage = this.highFiveMessages[Math.floor(Math.random() * this.highFiveMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ✋ High Five`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${highFiveMessage} ${user}`)
      .setImage('https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default HighFiveCommand;
