// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class UpgradeBusinessCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'upgradebusiness',
            description: 'Upgrade your business for higher income',
            category: 'economy',
            cooldown: 60,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['upgrade', 'levelupbusiness'],
            examples: ['/upgradebusiness', 'p!upgradebusiness'],
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
            const business = await prisma.business.findUnique({
                where: { ownerId: interaction.user.id, guildId: interaction.guildId },
            });
            if (!business) {
                await interaction.reply({ content: '❌ You don\'t own a business.', ephemeral: true });
                return;
            }
            const businessTypes = {
                'Small Shop': { cost: 5000, income: 100, nextCost: 10000, nextIncome: 200 },
                'Restaurant': { cost: 15000, income: 300, nextCost: 30000, nextIncome: 600 },
                'Tech Startup': { cost: 50000, income: 1000, nextCost: 100000, nextIncome: 2000 },
                'Manufacturing': { cost: 100000, income: 2500, nextCost: 200000, nextIncome: 5000 },
            };
            const type = businessTypes[business.name];
            if (!type) {
                await interaction.reply({ content: '❌ Cannot upgrade this business type.', ephemeral: true });
                return;
            }
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (wallet < type.nextCost) {
                await interaction.reply({ content: `❌ You need ${type.nextCost} ${guild.currencySymbol || '💰'} to upgrade.`, ephemeral: true });
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { decrement: type.nextCost } },
                }),
                prisma.business.update({
                    where: { ownerId: interaction.user.id, guildId: interaction.guildId },
                    update: { income: type.nextIncome },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Business Upgraded`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Business', value: business.name, inline: true },
                { name: 'Upgrade Cost', value: `${type.nextCost} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'New Income', value: `${type.nextIncome} ${guild.currencySymbol || '💰'}/day`, inline: true },
                { name: 'Old Income', value: `${type.income} ${guild.currencySymbol || '💰'}/day`, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to upgrade business.', ephemeral: true });
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
            const business = await prisma.business.findUnique({
                where: { ownerId: message.author.id, guildId: message.guildId },
            });
            if (!business) {
                await message.reply('❌ You don\'t own a business.');
                return;
            }
            const businessTypes = {
                'Small Shop': { cost: 5000, income: 100, nextCost: 10000, nextIncome: 200 },
                'Restaurant': { cost: 15000, income: 300, nextCost: 30000, nextIncome: 600 },
                'Tech Startup': { cost: 50000, income: 1000, nextCost: 100000, nextIncome: 2000 },
                'Manufacturing': { cost: 100000, income: 2500, nextCost: 200000, nextIncome: 5000 },
            };
            const type = businessTypes[business.name];
            if (!type) {
                await message.reply('❌ Cannot upgrade this business type.');
                return;
            }
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (wallet < type.nextCost) {
                await message.reply(`❌ You need ${type.nextCost} ${guild.currencySymbol || '💰'} to upgrade.`);
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { decrement: type.nextCost } },
                }),
                prisma.business.update({
                    where: { ownerId: message.author.id, guildId: message.guildId },
                    update: { income: type.nextIncome },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Business Upgraded`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Business', value: business.name, inline: true },
                { name: 'Upgrade Cost', value: `${type.nextCost} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'New Income', value: `${type.nextIncome} ${guild.currencySymbol || '💰'}/day`, inline: true },
                { name: 'Old Income', value: `${type.income} ${guild.currencySymbol || '💰'}/day`, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to upgrade business.');
        }
    }
}
export default UpgradeBusinessCommand;
