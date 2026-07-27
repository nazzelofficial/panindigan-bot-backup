// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetMonthlyAmountCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setmonthlyamount',
            description: 'Set the monthly reward amount (Admin)',
            category: 'economy',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['monthlyreward', 'setmonthly'],
            examples: ['/setmonthlyamount 5000', 'p!setmonthlyamount 5000'],
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
                update: { monthlyReward: amount },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Monthly Reward Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'New Monthly Reward', value: amount.toString(), inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to set monthly reward.', ephemeral: true });
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
                update: { monthlyReward: amount },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Monthly Reward Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'New Monthly Reward', value: amount.toString(), inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to set monthly reward.');
        }
    }
}
export default SetMonthlyAmountCommand;
