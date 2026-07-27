// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LotteryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'lottery',
            description: 'Buy a lottery ticket',
            category: 'economy',
            cooldown: 60,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['lotto'],
            examples: ['/lottery', 'p!lottery'],
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
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            });
            const wallet = economy?.wallet || 0;
            const ticketPrice = 50;
            if (wallet < ticketPrice) {
                await interaction.reply({ content: `❌ You need ${ticketPrice} ${guild.currencySymbol || '💰'} to buy a ticket.`, ephemeral: true });
                return;
            }
            await prisma.economy.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                update: { wallet: { decrement: ticketPrice } },
            });
            const lottery = await prisma.lottery.upsert({
                where: { guildId: interaction.guildId },
                update: {
                    participants: {
                        push: interaction.user.id,
                    },
                    pot: { increment: ticketPrice },
                },
                create: {
                    guildId: interaction.guildId,
                    participants: [interaction.user.id],
                    pot: ticketPrice,
                    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Lottery Ticket Purchased`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Price', value: `${ticketPrice} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Current Pot', value: `${lottery.pot} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Participants', value: lottery.participants.length.toString(), inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to buy lottery ticket.', ephemeral: true });
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
            const economy = await prisma.economy.findUnique({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
            });
            const wallet = economy?.wallet || 0;
            const ticketPrice = 50;
            if (wallet < ticketPrice) {
                await message.reply(`❌ You need ${ticketPrice} ${guild.currencySymbol || '💰'} to buy a ticket.`);
                return;
            }
            await prisma.economy.update({
                where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                update: { wallet: { decrement: ticketPrice } },
            });
            const lottery = await prisma.lottery.upsert({
                where: { guildId: message.guildId },
                update: {
                    participants: {
                        push: message.author.id,
                    },
                    pot: { increment: ticketPrice },
                },
                create: {
                    guildId: message.guildId,
                    participants: [message.author.id],
                    pot: ticketPrice,
                    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Lottery Ticket Purchased`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Price', value: `${ticketPrice} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Current Pot', value: `${lottery.pot} ${guild.currencySymbol || '💰'}`, inline: true },
                { name: 'Participants', value: lottery.participants.length.toString(), inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to buy lottery ticket.');
        }
    }
}
export default LotteryCommand;
