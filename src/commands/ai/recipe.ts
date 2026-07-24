import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RecipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'recipe',
      description: 'Generate a recipe using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generaterecipe', 'cook'],
      examples: ['/recipe pasta', 'p!recipe chicken dinner'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const dish = interaction.options.getString('dish') || '';
    if (!dish) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a dish for recipe generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🍳 AI Recipe Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Dish', value: dish, inline: false },
        { name: 'Recipe', value: 'This is a placeholder. AI recipe generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const dish = args.join(' ');

    if (!dish) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a dish for recipe generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🍳 AI Recipe Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Dish', value: dish, inline: false },
        { name: 'Recipe', value: 'This is a placeholder. AI recipe generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RecipeCommand;
