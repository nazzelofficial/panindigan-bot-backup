// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LoanStatusCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'loanstatus',
            description: 'View your loan status',
            category: 'economy',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['myloan', 'loandetails'],
            examples: ['/loanstatus', 'p!loanstatus'],
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
            const loan = await prisma.loan.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            if (!loan || loan.paid >= loan.amount) {
                await interaction.reply({ content: '❌ You don\'t have an active loan.', ephemeral: true });
                return;
            }
            const remaining = loan.amount - loan.paid;
            const totalDue = Math.floor(loan.amount * 1.1);
            const paidTotal = loan.paid;
            const remainingTotal = totalDue - paidTotal;
            const dueDate = new Date(loan.dueDate);
            const daysRemaining = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Loan Status`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Original Amount', value: `${loan.amount} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Paid', value: `${paidTotal} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Remaining Principal', value: `${remaining} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Total Due (with interest)', value: `${totalDue} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Remaining Total', value: `${remainingTotal} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Due Date', value: dueDate.toLocaleDateString(), inline: true },
                { name: 'Days Remaining', value: daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue!', inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch loan status.', ephemeral: true });
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
            const loan = await prisma.loan.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            if (!loan || loan.paid >= loan.amount) {
                await message.reply('❌ You don\'t have an active loan.');
                return;
            }
            const remaining = loan.amount - loan.paid;
            const totalDue = Math.floor(loan.amount * 1.1);
            const paidTotal = loan.paid;
            const remainingTotal = totalDue - paidTotal;
            const dueDate = new Date(loan.dueDate);
            const daysRemaining = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Loan Status`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Original Amount', value: `${loan.amount} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Paid', value: `${paidTotal} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Remaining Principal', value: `${remaining} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Total Due (with interest)', value: `${totalDue} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Remaining Total', value: `${remainingTotal} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Due Date', value: dueDate.toLocaleDateString(), inline: true },
                { name: 'Days Remaining', value: daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue!', inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch loan status.');
        }
    }
}
export default LoanStatusCommand;
