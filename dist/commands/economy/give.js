// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'give',
            description: 'Give money to another user',
            category: 'economy',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['pay', 'transfer', 'send'],
            examples: ['/give @user 100', 'p!give @user 100'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (!targetUser || targetUser.id === interaction.user.id) {
            await interaction.reply({ content: '❌ You cannot give money to yourself.', ephemeral: true });
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
            const senderEconomy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            const senderWallet = senderEconomy?.wallet || 0;
            if (senderWallet < amount) {
                await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { decrement: amount } },
                }),
                prisma.economy.upsert({
                    where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
                    update: { wallet: { increment: amount } },
                    create: { userId: targetUser.id, guildId: interaction.guildId, wallet: amount, bank: 0 },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Payment Sent`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'From', value: interaction.user.tag, inline: true },
                { name: 'To', value: targetUser.tag, inline: true },
                { name: 'Amount', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to send money.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!targetUser || targetUser.id === message.author.id) {
            await message.reply('❌ You cannot give money to yourself.');
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
            const senderEconomy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            const senderWallet = senderEconomy?.wallet || 0;
            if (senderWallet < amount) {
                await message.reply('❌ You don\'t have enough money in your wallet.');
                return;
            }
            await prisma.$transaction([
                prisma.economy.update({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { decrement: amount } },
                }),
                prisma.economy.upsert({
                    where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
                    update: { wallet: { increment: amount } },
                    create: { userId: targetUser.id, guildId: message.guildId, wallet: amount, bank: 0 },
                }),
            ]);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Payment Sent`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'From', value: message.author.tag, inline: true },
                { name: 'To', value: targetUser.tag, inline: true },
                { name: 'Amount', value: `${amount.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to send money.');
        }
    }
}
export default GiveCommand;
