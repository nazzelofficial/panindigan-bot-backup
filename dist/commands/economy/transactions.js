// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class TransactionsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'transactions',
            description: 'View your transaction history',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['history', 'tx'],
            examples: ['/transactions', 'p!transactions'],
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
            const transactions = await prisma.transaction.findMany({
                where: { userId: interaction.user.id, guildId: interaction.guildId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            if (transactions.length === 0) {
                await interaction.reply({ content: '❌ No transaction history found.', ephemeral: true });
                return;
            }
            const txList = transactions.map((tx) => {
                const type = tx.type;
                const amount = tx.amount;
                const date = new Date(tx.createdAt).toLocaleDateString();
                return `${type}: ${amount > 0 ? '+' : ''}${amount} ${guild.currencySymbol || '💰'} (${date})`;
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Transaction History`)
                .setColor(COLORS.info)
                .setDescription(txList.join('\n'))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch transactions.', ephemeral: true });
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
            const transactions = await prisma.transaction.findMany({
                where: { userId: message.author.id, guildId: message.guildId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            if (transactions.length === 0) {
                await message.reply('❌ No transaction history found.');
                return;
            }
            const txList = transactions.map((tx) => {
                const type = tx.type;
                const amount = tx.amount;
                const date = new Date(tx.createdAt).toLocaleDateString();
                return `${type}: ${amount > 0 ? '+' : ''}${amount} ${guild.currencySymbol || '💰'} (${date})`;
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Transaction History`)
                .setColor(COLORS.info)
                .setDescription(txList.join('\n'))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch transactions.');
        }
    }
}
export default TransactionsCommand;
