// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class MarketCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'market',
            description: 'View the market prices',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['prices', 'marketprices'],
            examples: ['/market', 'p!market'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: interaction.guildId },
                update: {},
                create: { guildId: interaction.guildId },
            });
            const items = [
                { name: 'Gold', price: Math.floor(Math.random() * 500) + 1500, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Silver', price: Math.floor(Math.random() * 100) + 300, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Oil', price: Math.floor(Math.random() * 200) + 400, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Tech Stocks', price: Math.floor(Math.random() * 1000) + 2000, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Real Estate', price: Math.floor(Math.random() * 5000) + 10000, trend: Math.random() > 0.5 ? '📈' : '📉' },
            ];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Market Prices`)
                .setColor(COLORS.info)
                .setDescription('Current market prices (fluctuate daily):')
                .addFields(items.map((item) => ({
                name: `${item.name} ${item.trend}`,
                value: `${item.price} ${guild.currencySymbol || '💰'}`,
                inline: true,
            })))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch market prices.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: message.guildId },
                update: {},
                create: { guildId: message.guildId },
            });
            const items = [
                { name: 'Gold', price: Math.floor(Math.random() * 500) + 1500, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Silver', price: Math.floor(Math.random() * 100) + 300, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Oil', price: Math.floor(Math.random() * 200) + 400, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Tech Stocks', price: Math.floor(Math.random() * 1000) + 2000, trend: Math.random() > 0.5 ? '📈' : '📉' },
                { name: 'Real Estate', price: Math.floor(Math.random() * 5000) + 10000, trend: Math.random() > 0.5 ? '📈' : '📉' },
            ];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Market Prices`)
                .setColor(COLORS.info)
                .setDescription('Current market prices (fluctuate daily):')
                .addFields(items.map((item) => ({
                name: `${item.name} ${item.trend}`,
                value: `${item.price} ${guild.currencySymbol || '💰'}`,
                inline: true,
            })))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch market prices.');
        }
    }
}
export default MarketCommand;
