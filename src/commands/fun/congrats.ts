// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CongratsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'congrats',
      description: 'Congratulate someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['congratulations', 'celebrate'],
      examples: ['/congrats @user', 'p!congrats @user'],
    };
    super(options);
  }

  private congratsMessages = [
    'congratulates! 🎉',
    'celebrates with! 🎊',
    'gives a big congratulations to! 🌟',
    'is proud of! 💖',
    'congratulates on their achievement! 🏆',
    'celebrates the success of! ✨',
    'says congratulations! 🎉',
    'honors! 🏅',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.congratsMessages[Math.floor(Math.random() * this.congratsMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎉 Congratulations`)
      .setColor(COLORS.success)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const congratsMessage = this.congratsMessages[Math.floor(Math.random() * this.congratsMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎉 Congratulations`)
      .setColor(COLORS.success)
      .setDescription(`${message.author} ${congratsMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CongratsCommand;
