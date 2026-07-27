// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ThanksCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'thanks',
      description: 'Say thank you',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['thankyou', 'ty'],
      examples: ['/thanks @user', 'p!thanks @user'],
    };
    super(options);
  }

  private thankMessages = [
    'says thank you! 🙏',
    'is grateful! 💖',
    'says thanks a lot! 🌟',
    'appreciates it! 😊',
    'says thank you so much! ✨',
    'is thankful! 🙏',
    'says thanks! 💫',
    'appreciates the help! 🌟',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.thankMessages[Math.floor(Math.random() * this.thankMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🙏 Thanks`)
      .setColor(COLORS.success)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const thankMessage = this.thankMessages[Math.floor(Math.random() * this.thankMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🙏 Thanks`)
      .setColor(COLORS.success)
      .setDescription(`${message.author} ${thankMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ThanksCommand;
