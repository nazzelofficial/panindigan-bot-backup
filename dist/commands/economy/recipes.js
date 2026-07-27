// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class RecipesCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'recipes',
            description: 'View available crafting recipes',
            category: 'economy',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['recipe', 'crafting'],
            examples: ['/recipes', 'p!recipes'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const recipes = await prisma.recipe.findMany({
                where: { guildId: interaction.guildId },
                include: { materials: true },
            });
            if (recipes.length === 0) {
                const defaultRecipes = [
                    { result: 'Sword', materials: '5 Iron, 2 Wood' },
                    { result: 'Shield', materials: '8 Iron, 1 Wood' },
                    { result: 'Potion', materials: '3 Herbs, 1 Water' },
                    { result: 'Bow', materials: '5 Wood, 2 String' },
                    { result: 'Armor', materials: '10 Iron, 5 Leather' },
                ];
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.economy} Crafting Recipes`)
                    .setColor(COLORS.info)
                    .setDescription('Default recipes:')
                    .addFields(defaultRecipes.map((recipe) => ({
                    name: recipe.result,
                    value: recipe.materials,
                    inline: false,
                })))
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Crafting Recipes`)
                .setColor(COLORS.info)
                .addFields(recipes.map((recipe) => ({
                name: recipe.resultItem,
                value: recipe.materials.map((m) => `${m.quantity}x Material`).join(', ') || 'No materials',
                inline: false,
            })))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch recipes.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const recipes = await prisma.recipe.findMany({
                where: { guildId: message.guildId },
                include: { materials: true },
            });
            if (recipes.length === 0) {
                const defaultRecipes = [
                    { result: 'Sword', materials: '5 Iron, 2 Wood' },
                    { result: 'Shield', materials: '8 Iron, 1 Wood' },
                    { result: 'Potion', materials: '3 Herbs, 1 Water' },
                    { result: 'Bow', materials: '5 Wood, 2 String' },
                    { result: 'Armor', materials: '10 Iron, 5 Leather' },
                ];
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.economy} Crafting Recipes`)
                    .setColor(COLORS.info)
                    .setDescription('Default recipes:')
                    .addFields(defaultRecipes.map((recipe) => ({
                    name: recipe.result,
                    value: recipe.materials,
                    inline: false,
                })))
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Crafting Recipes`)
                .setColor(COLORS.info)
                .addFields(recipes.map((recipe) => ({
                name: recipe.resultItem,
                value: recipe.materials.map((m) => `${m.quantity}x Material`).join(', ') || 'No materials',
                inline: false,
            })))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch recipes.');
        }
    }
}
export default RecipesCommand;
