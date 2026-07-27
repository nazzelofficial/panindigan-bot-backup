// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ComplimentCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'compliment',
      description: 'Give someone a compliment',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['praise', 'flatter'],
      examples: ['/compliment @user', 'p!compliment @user'],
    };
    super(options);
  }

  private compliments = [
    'You have an amazing smile! 😊',
    'You\'re incredibly talented! 🌟',
    'You make the world a better place! 💖',
    'You\'re so kind and thoughtful! 🌈',
    'You have a great sense of humor! 😄',
    'You\'re smart and witty! 💡',
    'You\'re a wonderful friend! 💕',
    'You\'re inspiring and motivating! ✨',
    'You have a beautiful soul! 🌟',
    'You\'re absolutely amazing! 💖',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const compliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💖 Compliment`)
      .setColor(COLORS.success)
      .setDescription(`${user}, ${compliment}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const compliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💖 Compliment`)
      .setColor(COLORS.success)
      .setDescription(`${user}, ${compliment}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ComplimentCommand;
