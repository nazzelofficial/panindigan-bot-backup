// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class AddBalanceCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'addbalance',
            description: 'Add money to a user\'s balance (Admin only)',
            category: 'economy',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['addbal', 'addmoney'],
            examples: ['/addbalance @user 100', 'p!addbalance @user 100'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (!targetUser) {
            await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
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
            await prisma.economy.upsert({
                where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
                update: { wallet: { increment: amount } },
                create: { userId: targetUser.id, guildId: interaction.guildId, wallet: amount, bank: 0 },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Balance Added`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: targetUser.tag, inline: true },
                { name: 'Added', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to add balance.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!targetUser) {
            await message.reply('❌ Please provide a user.');
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
            await prisma.economy.upsert({
                where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
                update: { wallet: { increment: amount } },
                create: { userId: targetUser.id, guildId: message.guildId, wallet: amount, bank: 0 },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Balance Added`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: targetUser.tag, inline: true },
                { name: 'Added', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to add balance.');
        }
    }
}
export default AddBalanceCommand;
