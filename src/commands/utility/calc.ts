import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CalcCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'calc',
      description: 'Perform a mathematical calculation',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['calculate', 'math'],
      examples: ['/calc 2+2', '/calc 10*5', 'p!calc (5+3)*2'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const expression = interaction.options.getString('expression');
    
    if (!expression) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a mathematical expression.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const result = this.evaluate(expression);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🧮 Calculator`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Expression', value: expression, inline: true },
          { name: 'Result', value: result.toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid mathematical expression.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const expression = args.join(' ').replace(/ /g, '');

    if (!expression) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a mathematical expression.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const result = this.evaluate(expression);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🧮 Calculator`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Expression', value: expression, inline: true },
          { name: 'Result', value: result.toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid mathematical expression.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }

  private evaluate(expression: string): number {
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    return Function(`"use strict"; return (${sanitized})`)();
  }
}

export default CalcCommand;
