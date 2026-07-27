// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class StockMarketCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'stockmarket',
            description: 'View the stock market',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['stocks', 'stock'],
            examples: ['/stockmarket', 'p!stockmarket'],
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
            const stocks = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: Math.floor(Math.random() * 200) + 150, change: (Math.random() - 0.5) * 10 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: Math.floor(Math.random() * 150) + 120, change: (Math.random() - 0.5) * 10 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: Math.floor(Math.random() * 180) + 280, change: (Math.random() - 0.5) * 10 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: Math.floor(Math.random() * 100) + 130, change: (Math.random() - 0.5) * 10 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: Math.floor(Math.random() * 300) + 200, change: (Math.random() - 0.5) * 15 },
            ];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Stock Market`)
                .setColor(COLORS.info)
                .setDescription('Current stock prices:')
                .addFields(stocks.map((stock) => ({
                name: `${stock.symbol} - ${stock.name}`,
                value: `$${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%)`,
                inline: false,
            })))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch stock market.', ephemeral: true });
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
            const stocks = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: Math.floor(Math.random() * 200) + 150, change: (Math.random() - 0.5) * 10 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: Math.floor(Math.random() * 150) + 120, change: (Math.random() - 0.5) * 10 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: Math.floor(Math.random() * 180) + 280, change: (Math.random() - 0.5) * 10 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: Math.floor(Math.random() * 100) + 130, change: (Math.random() - 0.5) * 10 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: Math.floor(Math.random() * 300) + 200, change: (Math.random() - 0.5) * 15 },
            ];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Stock Market`)
                .setColor(COLORS.info)
                .setDescription('Current stock prices:')
                .addFields(stocks.map((stock) => ({
                name: `${stock.symbol} - ${stock.name}`,
                value: `$${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%)`,
                inline: false,
            })))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch stock market.');
        }
    }
}
export default StockMarketCommand;
