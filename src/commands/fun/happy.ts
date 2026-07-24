import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HappyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'happy',
      description: 'Express happiness',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['joy', 'joyful'],
      examples: ['/happy', 'p!happy'],
    };
    super(options);
  }

  private happyMessages = [
    'is feeling very happy today! 😊',
    'is full of joy and happiness! 🎉',
    'is bursting with happiness! ✨',
    'is so happy right now! 😄',
    'is feeling absolutely joyful! 🥳',
    'is spreading happiness everywhere! 💖',
    'is in a great mood! 😊',
    'is feeling blessed and happy! 🙏',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.happyMessages[Math.floor(Math.random() * this.happyMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Happy`)
      .setColor(COLORS.success)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const happyMessage = this.happyMessages[Math.floor(Math.random() * this.happyMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Happy`)
      .setColor(COLORS.success)
      .setDescription(`${message.author} ${happyMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default HappyCommand;
