import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TickleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'tickle',
      description: 'Tickle someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['giggle'],
      examples: ['/tickle @user', 'p!tickle @user'],
    };
    super(options);
  }

  private tickleMessages = [
    'tickles',
    'gives a tickle to',
    'tickles playfully',
    'gives a mischievous tickle to',
    'tickles until they laugh',
    'gives a gentle tickle to',
    'tickles with feathers',
    'gives a silly tickle to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.tickleMessages[Math.floor(Math.random() * this.tickleMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😆 Tickle`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const tickleMessage = this.tickleMessages[Math.floor(Math.random() * this.tickleMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😆 Tickle`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${tickleMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TickleCommand;
