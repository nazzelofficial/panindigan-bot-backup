// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SnakeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'snake',
            description: 'Play a snake game',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['snakegame'],
            examples: ['/snake', 'p!snake'],
        };
        super(options);
    }
    gridSize = 10;
    snake = [[5, 5]];
    food = [3, 3];
    direction = [0, 0];
    score = 0;
    gameOver = false;
    initializeGame() {
        this.snake = [[5, 5]];
        this.food = [Math.floor(Math.random() * this.gridSize), Math.floor(Math.random() * this.gridSize)];
        this.direction = [0, 0];
        this.score = 0;
        this.gameOver = false;
    }
    displayBoard() {
        let board = '';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.snake.some((segment) => segment[0] === x && segment[1] === y)) {
                    board += '🐍';
                }
                else if (this.food[0] === x && this.food[1] === y) {
                    board += '🍎';
                }
                else {
                    board += '⬜';
                }
            }
            board += '\n';
        }
        return board;
    }
    moveSnake() {
        if (this.direction[0] === 0 && this.direction[1] === 0)
            return;
        const head = this.snake[0];
        const newHead = [head[0] + this.direction[0], head[1] + this.direction[1]];
        if (newHead[0] < 0 || newHead[0] >= this.gridSize || newHead[1] < 0 || newHead[1] >= this.gridSize) {
            this.gameOver = true;
            return;
        }
        if (this.snake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])) {
            this.gameOver = true;
            return;
        }
        this.snake.unshift(newHead);
        if (newHead[0] === this.food[0] && newHead[1] === this.food[1]) {
            this.score += 10;
            this.food = [Math.floor(Math.random() * this.gridSize), Math.floor(Math.random() * this.gridSize)];
        }
        else {
            this.snake.pop();
        }
    }
    async executeSlash(interaction) {
        this.initializeGame();
        const createButtons = () => {
            const row1 = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('snake_up').setLabel('⬆️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_down').setLabel('⬇️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_left').setLabel('⬅️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_right').setLabel('➡️').setStyle(ButtonStyle.Primary));
            return [row1];
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Snake`)
            .setColor(COLORS.info)
            .setDescription(`Score: ${this.score}\n\n${this.displayBoard()}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: createButtons() });
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000,
        });
        collector?.on('collect', async (i) => {
            const direction = i.customId.split('_')[1];
            switch (direction) {
                case 'up':
                    if (this.direction[1] !== 1)
                        this.direction = [0, -1];
                    break;
                case 'down':
                    if (this.direction[1] !== -1)
                        this.direction = [0, 1];
                    break;
                case 'left':
                    if (this.direction[0] !== 1)
                        this.direction = [-1, 0];
                    break;
                case 'right':
                    if (this.direction[0] !== -1)
                        this.direction = [1, 0];
                    break;
            }
            this.moveSnake();
            if (this.gameOver) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await i.update({ embeds: [loseEmbed], components: [] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Snake`)
                    .setColor(COLORS.info)
                    .setDescription(`Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await i.update({ embeds: [updateEmbed], components: createButtons() });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        this.initializeGame();
        const createButtons = () => {
            const row1 = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('snake_up').setLabel('⬆️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_down').setLabel('⬇️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_left').setLabel('⬅️').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('snake_right').setLabel('➡️').setStyle(ButtonStyle.Primary));
            return [row1];
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Snake`)
            .setColor(COLORS.info)
            .setDescription(`Score: ${this.score}\n\n${this.displayBoard()}`)
            .setTimestamp();
        await message.reply({ embeds: [embed], components: createButtons() });
        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000,
        });
        collector.on('collect', async (i) => {
            const direction = i.customId.split('_')[1];
            switch (direction) {
                case 'up':
                    if (this.direction[1] !== 1)
                        this.direction = [0, -1];
                    break;
                case 'down':
                    if (this.direction[1] !== -1)
                        this.direction = [0, 1];
                    break;
                case 'left':
                    if (this.direction[0] !== 1)
                        this.direction = [-1, 0];
                    break;
                case 'right':
                    if (this.direction[0] !== -1)
                        this.direction = [1, 0];
                    break;
            }
            this.moveSnake();
            if (this.gameOver) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await i.update({ embeds: [loseEmbed], components: [] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Snake`)
                    .setColor(COLORS.info)
                    .setDescription(`Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await i.update({ embeds: [updateEmbed], components: createButtons() });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}\n\n${this.displayBoard()}`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default SnakeCommand;
