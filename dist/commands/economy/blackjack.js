// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class BlackjackCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'blackjack',
            description: 'Play blackjack',
            category: 'economy',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['bj', '21'],
            examples: ['/blackjack 100', 'p!blackjack 100'],
        };
        super(options);
    }
    calculateHand(hand) {
        let total = hand.reduce((sum, card) => sum + card, 0);
        const aces = hand.filter((card) => card === 11).length;
        for (let i = 0; i < aces && total > 21; i++) {
            total -= 10;
        }
        return total;
    }
    drawCard() {
        const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
        return cards[Math.floor(Math.random() * cards.length)];
    }
    cardToString(card) {
        if (card === 11)
            return 'A';
        if (card === 10)
            return '10';
        return card.toString();
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
            await interaction.deferReply();
            const playerHand = [this.drawCard(), this.drawCard()];
            const dealerHand = [this.drawCard(), this.drawCard()];
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Blackjack`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Your Hand', value: playerHand.map(this.cardToString).join(' ') + ` (${this.calculateHand(playerHand)})`, inline: false },
                { name: 'Dealer\'s Hand', value: dealerHand[0] + ' ?', inline: false },
                { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [embed], components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            { type: ComponentType.Button, style: ButtonStyle.Primary, label: 'Hit', customId: 'hit' },
                            { type: ComponentType.Button, style: ButtonStyle.Danger, label: 'Stand', customId: 'stand' },
                        ],
                    },
                ] });
            const collector = interaction.channel?.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 30000,
            });
            collector?.on('collect', async (i) => {
                if (i.customId === 'hit') {
                    playerHand.push(this.drawCard());
                    const playerTotal = this.calculateHand(playerHand);
                    if (playerTotal > 21) {
                        await prisma.economy.update({
                            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                            update: { wallet: { decrement: amount } },
                        });
                        const bustEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.error} Bust!`)
                            .setColor(COLORS.error)
                            .addFields([
                            { name: 'Your Hand', value: playerHand.map(this.cardToString).join(' ') + ` (${playerTotal})`, inline: false },
                            { name: 'Lost', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
                        ])
                            .setTimestamp();
                        await i.update({ embeds: [bustEmbed], components: [] });
                        collector.stop();
                    }
                    else {
                        const hitEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.economy} Blackjack`)
                            .setColor(COLORS.info)
                            .addFields([
                            { name: 'Your Hand', value: playerHand.map(this.cardToString).join(' ') + ` (${playerTotal})`, inline: false },
                            { name: 'Dealer\'s Hand', value: dealerHand[0] + ' ?', inline: false },
                            { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
                        ])
                            .setTimestamp();
                        await i.update({ embeds: [hitEmbed] });
                    }
                }
                else if (i.customId === 'stand') {
                    while (this.calculateHand(dealerHand) < 17) {
                        dealerHand.push(this.drawCard());
                    }
                    const playerTotal = this.calculateHand(playerHand);
                    const dealerTotal = this.calculateHand(dealerHand);
                    let won = false;
                    let winnings = 0;
                    if (dealerTotal > 21) {
                        won = true;
                        winnings = amount;
                    }
                    else if (playerTotal > dealerTotal) {
                        won = true;
                        winnings = amount;
                    }
                    else if (playerTotal === dealerTotal) {
                        winnings = amount;
                    }
                    await prisma.economy.update({
                        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                        update: { wallet: { increment: winnings - amount } },
                    });
                    const resultEmbed = new EmbedBuilder()
                        .setTitle(won ? `${EMOJIS.economy} You Won!` : `${EMOJIS.error} You Lost`)
                        .setColor(won ? COLORS.success : COLORS.error)
                        .addFields([
                        { name: 'Your Hand', value: playerHand.map(this.cardToString).join(' ') + ` (${playerTotal})`, inline: false },
                        { name: 'Dealer\'s Hand', value: dealerHand.map(this.cardToString).join(' ') + ` (${dealerTotal})`, inline: false },
                        { name: 'Bet', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
                        { name: 'Result', value: `${winnings} ${guild.currencySymbol || '💰'}`, inline: true },
                    ])
                        .setTimestamp();
                    await i.update({ embeds: [resultEmbed], components: [] });
                    collector.stop();
                }
            });
            collector?.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({ components: [] });
                }
            });
        }
        catch (error) {
            await interaction.editReply({ content: '❌ Failed to play blackjack.' });
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
            await message.reply('🃏 Blackjack game started! Use /blackjack for the full interactive experience.');
        }
        catch (error) {
            await message.reply('❌ Failed to play blackjack.');
        }
    }
}
export default BlackjackCommand;
