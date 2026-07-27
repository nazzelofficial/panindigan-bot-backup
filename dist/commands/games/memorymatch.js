// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class MemoryMatchCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'memorymatch',
            description: 'Play a memory matching game',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['memory', 'match'],
            examples: ['/memorymatch', 'p!memorymatch'],
        };
        super(options);
    }
    emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isProcessing = false;
    initializeGame() {
        this.cards = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isProcessing = false;
    }
    createButtons() {
        const rows = [];
        const buttonsPerRow = 4;
        for (let i = 0; i < this.cards.length; i += buttonsPerRow) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < buttonsPerRow && i + j < this.cards.length; j++) {
                const index = i + j;
                const isFlipped = this.flippedCards.includes(index);
                const isMatched = this.flippedCards.filter((idx) => this.cards[idx] === this.cards[index]).length === 2;
                row.addComponents(new ButtonBuilder()
                    .setCustomId(`memory_${index}`)
                    .setLabel(isMatched ? this.cards[index] : (isFlipped ? this.cards[index] : '?'))
                    .setStyle(isMatched ? ButtonStyle.Success : (isFlipped ? ButtonStyle.Primary : ButtonStyle.Secondary))
                    .setDisabled(isMatched || isFlipped || this.isProcessing));
            }
            rows.push(row);
        }
        return rows;
    }
    async executeSlash(interaction) {
        this.initializeGame();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Memory Match`)
            .setColor(COLORS.info)
            .setDescription(`Find all matching pairs! Moves: ${this.moves}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: this.createButtons() });
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000,
        });
        collector?.on('collect', async (i) => {
            const index = parseInt(i.customId.split('_')[1]);
            if (this.isProcessing || this.flippedCards.includes(index))
                return;
            this.flippedCards.push(index);
            if (this.flippedCards.length === 2) {
                this.moves++;
                this.isProcessing = true;
                const [first, second] = this.flippedCards;
                const isMatch = this.cards[first] === this.cards[second];
                await i.update({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (isMatch) {
                    this.matchedPairs++;
                    this.flippedCards = [];
                    this.isProcessing = false;
                    if (this.matchedPairs === this.emojis.length) {
                        const winEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.games} You Won!`)
                            .setColor(COLORS.success)
                            .setDescription(`You found all pairs in ${this.moves} moves!`)
                            .setTimestamp();
                        await i.editReply({ embeds: [winEmbed], components: [] });
                        collector.stop();
                    }
                    else {
                        await i.editReply({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                    }
                }
                else {
                    this.flippedCards = [];
                    this.isProcessing = false;
                    await i.editReply({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                }
            }
            else {
                await i.update({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Ended`)
                    .setColor(COLORS.error)
                    .setDescription(`Game timed out. You found ${this.matchedPairs} pairs in ${this.moves} moves.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        this.initializeGame();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Memory Match`)
            .setColor(COLORS.info)
            .setDescription(`Find all matching pairs! Moves: ${this.moves}`)
            .setTimestamp();
        await message.reply({ embeds: [embed], components: this.createButtons() });
        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000,
        });
        collector.on('collect', async (i) => {
            const index = parseInt(i.customId.split('_')[1]);
            if (this.isProcessing || this.flippedCards.includes(index))
                return;
            this.flippedCards.push(index);
            if (this.flippedCards.length === 2) {
                this.moves++;
                this.isProcessing = true;
                const [first, second] = this.flippedCards;
                const isMatch = this.cards[first] === this.cards[second];
                await i.update({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (isMatch) {
                    this.matchedPairs++;
                    this.flippedCards = [];
                    this.isProcessing = false;
                    if (this.matchedPairs === this.emojis.length) {
                        const winEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.games} You Won!`)
                            .setColor(COLORS.success)
                            .setDescription(`You found all pairs in ${this.moves} moves!`)
                            .setTimestamp();
                        await i.editReply({ embeds: [winEmbed], components: [] });
                        collector.stop();
                    }
                    else {
                        await i.editReply({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                    }
                }
                else {
                    this.flippedCards = [];
                    this.isProcessing = false;
                    await i.editReply({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
                }
            }
            else {
                await i.update({ embeds: [embed.setDescription(`Moves: ${this.moves}`)], components: this.createButtons() });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Ended`)
                    .setColor(COLORS.error)
                    .setDescription(`Game timed out. You found ${this.matchedPairs} pairs in ${this.moves} moves.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default MemoryMatchCommand;
