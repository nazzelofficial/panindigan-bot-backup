// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SellCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'sell',
            description: 'Sell an item from your inventory',
            category: 'economy',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['vend'],
            examples: ['/sell Dice', 'p!sell Dice'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const itemName = interaction.options.getString('item');
        if (!itemName) {
            await interaction.reply({ content: '❌ Please provide an item name.', ephemeral: true });
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
            const shopItem = await prisma.shopItem.findFirst({
                where: { guildId: interaction.guildId, name: { equals: itemName, mode: 'insensitive' } },
            });
            if (!shopItem) {
                await interaction.reply({ content: '❌ Item not found.', ephemeral: true });
                return;
            }
            const inventory = await prisma.inventory.findUnique({
                where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
            });
            if (!inventory || inventory.quantity <= 0) {
                await interaction.reply({ content: '❌ You don\'t have this item.', ephemeral: true });
                return;
            }
            const sellPrice = Math.floor(shopItem.price * 0.5);
            await prisma.$transaction([
                prisma.inventory.update({
                    where: { userId_itemId: { userId: interaction.user.id, itemId: shopItem.id } },
                    update: { quantity: { decrement: 1 } },
                }),
                prisma.economy.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { increment: sellPrice } },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Item Sold`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Item', value: shopItem.name, inline: true },
                { name: 'Sold for', value: `${sellPrice} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to sell item.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const itemName = _args.join(' ');
        if (!itemName) {
            await message.reply('❌ Please provide an item name.');
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
            const shopItem = await prisma.shopItem.findFirst({
                where: { guildId: message.guildId, name: { equals: itemName, mode: 'insensitive' } },
            });
            if (!shopItem) {
                await message.reply('❌ Item not found.');
                return;
            }
            const inventory = await prisma.inventory.findUnique({
                where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
            });
            if (!inventory || inventory.quantity <= 0) {
                await message.reply('❌ You don\'t have this item.');
                return;
            }
            const sellPrice = Math.floor(shopItem.price * 0.5);
            await prisma.$transaction([
                prisma.inventory.update({
                    where: { userId_itemId: { userId: message.author.id, itemId: shopItem.id } },
                    update: { quantity: { decrement: 1 } },
                }),
                prisma.economy.update({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { increment: sellPrice } },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Item Sold`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Item', value: shopItem.name, inline: true },
                { name: 'Sold for', value: `${sellPrice} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to sell item.');
        }
    }
}
export default SellCommand;
