// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class LeavingCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'leaving',
      description: 'Say goodbye to someone leaving',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['byebye', 'farewell'],
      examples: ['/leaving @user', 'p!leaving @user'],
    };
    super(options);
  }

  private leavingMessages = [
    'says goodbye to! 👋',
    'will miss! 😢',
    'says farewell to! 🌟',
    'hopes to see again! 💖',
    'says bye bye to! 🎊',
    'gives a fond farewell to! ✨',
    'says goodbye! Come back soon! 🌈',
    'will miss! Take care! 🌟',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.leavingMessages[Math.floor(Math.random() * this.leavingMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const leavingMessage = this.leavingMessages[Math.floor(Math.random() * this.leavingMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${leavingMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LeavingCommand;
