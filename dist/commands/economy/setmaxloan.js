// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetMaxLoanCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setmaxloan',
            description: 'Set the maximum loan amount (Admin)',
            category: 'economy',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['loanlimit', 'maxloan'],
            examples: ['/setmaxloan 10000', 'p!setmaxloan 10000'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const amount = interaction.options.getInteger('amount');
        if (amount === null || amount <= 0) {
            await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
            return;
        }
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            await prisma.guild.update({
                where: { guildId: interaction.guildId },
                update: { maxLoan: amount },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Max Loan Amount Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'New Max Loan', value: amount.toLocaleString(), inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to set max loan amount.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            await message.reply('❌ Please provide a valid amount.');
            return;
        }
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            await prisma.guild.update({
                where: { guildId: message.guildId },
                update: { maxLoan: amount },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Max Loan Amount Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'New Max Loan', value: amount.toLocaleString(), inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to set max loan amount.');
        }
    }
}
export default SetMaxLoanCommand;
