// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SlotsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'slots',
            description: 'Play slots',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['slot', 'spin'],
            examples: ['/slots 50', 'p!slots 50'],
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
            const guild = await prisma.guild.upsert({
                where: { guildId: interaction.guildId },
                update: {},
                create: { guildId: interaction.guildId },
            });
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (amount > wallet) {
                await interaction.reply({ content: '❌ You don\'t have enough money in your wallet.', ephemeral: true });
                return;
            }
            if (amount < 10) {
                await interaction.reply({ content: '❌ Minimum bet is 10.', ephemeral: true });
                return;
            }
            const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
            const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
            let winnings = 0;
            let result = '';
            if (slot1 === slot2 && slot2 === slot3) {
                if (slot1 === '💎' || slot1 === '7️⃣') {
                    winnings = amount * 10;
                    result = 'JACKPOT!';
                }
                else if (slot1 === '⭐') {
                    winnings = amount * 5;
                    result = 'Big Win!';
                }
                else {
                    winnings = amount * 3;
                    result = 'Triple!';
                }
            }
            else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                winnings = Math.floor(amount * 1.5);
                result = 'Double!';
            }
            else {
                winnings = 0;
                result = 'No match';
            }
            await prisma.economy.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                update: { wallet: { increment: winnings - amount } },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Slots`)
                .setColor(winnings > amount ? COLORS.success : COLORS.error)
                .addFields([
                { name: 'Result', value: `${slot1} ${slot2} ${slot3}`, inline: false },
                { name: 'Outcome', value: result, inline: true },
                { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Winnings', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to play slots.', ephemeral: true });
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
            const guild = await prisma.guild.upsert({
                where: { guildId: message.guildId },
                update: {},
                create: { guildId: message.guildId },
            });
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            const wallet = economy?.wallet || 0;
            if (amount > wallet) {
                await message.reply('❌ You don\'t have enough money in your wallet.');
                return;
            }
            if (amount < 10) {
                await message.reply('❌ Minimum bet is 10.');
                return;
            }
            const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
            const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
            let winnings = 0;
            let result = '';
            if (slot1 === slot2 && slot2 === slot3) {
                if (slot1 === '💎' || slot1 === '7️⃣') {
                    winnings = amount * 10;
                    result = 'JACKPOT!';
                }
                else if (slot1 === '⭐') {
                    winnings = amount * 5;
                    result = 'Big Win!';
                }
                else {
                    winnings = amount * 3;
                    result = 'Triple!';
                }
            }
            else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                winnings = Math.floor(amount * 1.5);
                result = 'Double!';
            }
            else {
                winnings = 0;
                result = 'No match';
            }
            await prisma.economy.update({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                update: { wallet: { increment: winnings - amount } },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Slots`)
                .setColor(winnings > amount ? COLORS.success : COLORS.error)
                .addFields([
                { name: 'Result', value: `${slot1} ${slot2} ${slot3}`, inline: false },
                { name: 'Outcome', value: result, inline: true },
                { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Winnings', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to play slots.');
        }
    }
}
export default SlotsCommand;
