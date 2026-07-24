import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RecipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'recipe',
      description: 'Get an AI-generated recipe for any dish',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cook', 'dish'],
      examples: ['/recipe Adobo', 'p!recipe Chocolate lava cake'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('dish').setDescription('Dish or food to get recipe for').setRequired(true))
      .addStringOption(o => o.setName('servings').setDescription('Number of servings').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const dish = interaction.options.getString('dish', true);
    const servings = interaction.options.getString('servings') || '4';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Recipe for: ${dish} (${servings} servings)`,
        `You are a professional chef. Provide a complete recipe for the requested dish. Include: 📋 Ingredients (with measurements for ${servings} servings), 👨‍🍳 Step-by-step instructions, ⏱️ Prep and cook time, 💡 Chef's tips and variations, 🌟 Nutritional highlights. Make it clear and easy to follow.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🍳 Recipe: ${dish}`)
        .setColor(0xf97316)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Serves: ${servings} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const dish = args.join(' ');
    if (!dish) return void message.reply(`${EMOJIS.error} Please provide a dish name.`);
    const thinking = await message.reply(`${EMOJIS.ai} Finding recipe...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Recipe for: ${dish}`,
        'Provide a complete recipe: ingredients with measurements, step-by-step instructions, prep/cook time, and chef tips.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🍳 Recipe: ${dish}`)
        .setColor(0xf97316)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default RecipeCommand;
