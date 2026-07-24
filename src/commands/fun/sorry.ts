import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SorryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sorry',
      description: 'Say sorry',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['apologize'],
      examples: ['/sorry @user', 'p!sorry @user'],
    };
    super(options);
  }

  private sorryMessages = [
    'says sorry! 😔',
    'apologizes sincerely! 🙏',
    'says sorry about that! 😢',
    'asks for forgiveness! 🙏',
    'says sorry! Won\'t happen again! 😔',
    'apologizes! My bad! 🙏',
    'says sorry! Please forgive me! 😢',
    'apologizes deeply! 🙏',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.sorryMessages[Math.floor(Math.random() * this.sorryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😔 Sorry`)
      .setColor(COLORS.warning)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const sorryMessage = this.sorryMessages[Math.floor(Math.random() * this.sorryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😔 Sorry`)
      .setColor(COLORS.warning)
      .setDescription(`${message.author} ${sorryMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SorryCommand;
