import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GoodMorningCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'goodmorning',
      description: 'Say good morning',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gm'],
      examples: ['/goodmorning', 'p!goodmorning'],
    };
    super(options);
  }

  private morningGreetings = [
    'Good morning! ☀️ Have a great day!',
    'Rise and shine! 🌅 Good morning!',
    'Good morning! Hope your day is amazing! 🌟',
    'Morning! Time to start the day! ☀️',
    'Good morning! Wishing you the best! 🌅',
    'Morning sunshine! Have a wonderful day! ☀️',
    'Good morning! Let\'s make today great! 🌟',
    'Rise and grind! Good morning! 💪',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const greeting = this.morningGreetings[Math.floor(Math.random() * this.morningGreetings.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ☀️ Good Morning`)
      .setColor(COLORS.success)
      .setDescription(`${greeting}`)
      .addFields([
        { name: 'User', value: interaction.user.username, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const greeting = this.morningGreetings[Math.floor(Math.random() * this.morningGreetings.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ☀️ Good Morning`)
      .setColor(COLORS.success)
      .setDescription(`${greeting}`)
      .addFields([
        { name: 'User', value: message.author.username, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GoodMorningCommand;
