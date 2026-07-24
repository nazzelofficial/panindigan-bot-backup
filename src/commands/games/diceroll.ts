import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DiceRollCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'diceroll',
      description: 'Roll a dice',
      category: 'games',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['roll', 'dice'],
      examples: ['/diceroll', 'p!diceroll'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Dice Roll`)
      .setColor(COLORS.info)
      .setDescription(`🎲 You rolled a **${result}** (1-${sides})`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const sides = parseInt(args[0]) || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Dice Roll`)
      .setColor(COLORS.info)
      .setDescription(`🎲 You rolled a **${result}** (1-${sides})`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DiceRollCommand;
