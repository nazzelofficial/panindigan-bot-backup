import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WelcomeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'welcome',
      description: 'Welcome someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['welc'],
      examples: ['/welcome @user', 'p!welcome @user'],
    };
    super(options);
  }

  private welcomeMessages = [
    'welcomes! 🎉',
    'gives a warm welcome to! 🌟',
    'welcomes with open arms! 💖',
    'says welcome to the family! 🎊',
    'welcomes aboard! ✨',
    'gives a friendly welcome to! 🌈',
    'welcomes! Hope you enjoy your stay! 🎉',
    'says welcome! Great to have you! 🌟',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.welcomeMessages[Math.floor(Math.random() * this.welcomeMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎉 Welcome`)
      .setColor(COLORS.success)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const welcomeMessage = this.welcomeMessages[Math.floor(Math.random() * this.welcomeMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎉 Welcome`)
      .setColor(COLORS.success)
      .setDescription(`${message.author} ${welcomeMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WelcomeCommand;
