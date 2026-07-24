import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class KissCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kiss',
      description: 'Give someone a kiss',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['smooch', 'peck'],
      examples: ['/kiss @user', 'p!kiss @user'],
    };
    super(options);
  }

  private kissMessages = [
    'gives a sweet kiss to',
    'kisses',
    'gives a loving kiss to',
    'gives a romantic kiss to',
    'gives a gentle kiss to',
    'gives a passionate kiss to',
    'gives a cute peck on the cheek to',
    'gives a tender kiss to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.kissMessages[Math.floor(Math.random() * this.kissMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💋 Kiss`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/G3va31oEkkXSm/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const kissMessage = this.kissMessages[Math.floor(Math.random() * this.kissMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💋 Kiss`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${kissMessage} ${user}`)
      .setImage('https://media.giphy.com/media/G3va31oEkkXSm/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default KissCommand;
