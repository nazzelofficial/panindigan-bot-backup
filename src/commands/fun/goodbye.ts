import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GoodbyeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'goodbye',
      description: 'Say goodbye',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bye', 'farewell'],
      examples: ['/goodbye', 'p!goodbye'],
    };
    super(options);
  }

  private farewells = [
    'Goodbye! See you later! 👋',
    'Bye! Have a great day! 🌟',
    'Farewell! Take care! 😊',
    'Goodbye! Come back soon! 💫',
    'Bye for now! 🎉',
    'See ya! Good luck! 🍀',
    'Goodbye! Stay awesome! ✨',
    'Bye! Miss you already! 💖',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const farewell = this.farewells[Math.floor(Math.random() * this.farewells.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
      .setColor(COLORS.info)
      .setDescription(`${farewell}`)
      .addFields([
        { name: 'User', value: interaction.user.username, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const farewell = this.farewells[Math.floor(Math.random() * this.farewells.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Goodbye`)
      .setColor(COLORS.info)
      .setDescription(`${farewell}`)
      .addFields([
        { name: 'User', value: message.author.username, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GoodbyeCommand;
