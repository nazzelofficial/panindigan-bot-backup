// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class InvestCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'invest',
            description: 'Invest money in the market',
            category: 'economy',
            cooldown: 60,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['buyinvestment'],
            examples: ['/invest Gold 1000', 'p!invest Gold 1000'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const item = interaction.options.getString('item');
        const amount = interaction.options.getInteger('amount');
        if (!item) {
            await interaction.reply({ content: '❌ Please provide an investment item (Gold, Silver, Oil, Tech Stocks, Real Estate).', ephemeral: true });
            return;
        }
        if (amount === null || amount <= 0) {
            await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
            return;
        }
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: interaction.guildId },
                update: {},
                create: { guildId: interaction.guildId },
            });
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (wallet < amount) {
                await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
                return;
            }
            const validItems = ['Gold', 'Silver', 'Oil', 'Tech Stocks', 'Real Estate'];
            if (!validItems.includes(item)) {
                await interaction.reply({ content: '❌ Invalid investment item.', ephemeral: true });
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { decrement: amount } },
                }),
                prisma.investment.upsert({
                    where: { userId_item: { userId: interaction.user.id, item } },
                    update: { amount: { increment: amount } },
                    create: { userId: interaction.user.id, item, amount, guildId: interaction.guildId },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Investment Made`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Item', value: item, inline: true },
                { name: 'Invested', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to invest.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const item = args[0];
        const amount = parseInt(args[1]);
        if (!item) {
            await message.reply('❌ Please provide an investment item (Gold, Silver, Oil, Tech Stocks, Real Estate).');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            await message.reply('❌ Please provide a valid amount.');
            return;
        }
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: message.guildId },
                update: {},
                create: { guildId: message.guildId },
            });
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (wallet < amount) {
                await message.reply('❌ You don\'t have enough money in your wallet.');
                return;
            }
            const validItems = ['Gold', 'Silver', 'Oil', 'Tech Stocks', 'Real Estate'];
            if (!validItems.includes(item)) {
                await message.reply('❌ Invalid investment item.');
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { decrement: amount } },
                }),
                prisma.investment.upsert({
                    where: { userId_item: { userId: message.author.id, item } },
                    update: { amount: { increment: amount } },
                    create: { userId: message.author.id, item, amount, guildId: message.guildId },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Investment Made`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Item', value: item, inline: true },
                { name: 'Invested', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to invest.');
        }
    }
}
export default InvestCommand;
