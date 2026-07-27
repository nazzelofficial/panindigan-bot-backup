// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SudokuGameCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'sudokugame',
            description: 'Play a simplified Sudoku game',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['sudoku'],
            examples: ['/sudokugame', 'p!sudokugame'],
        };
        super(options);
    }
    generatePuzzle() {
        const puzzle = Array(9).fill(null).map(() => Array(9).fill(0));
        const solution = Array(9).fill(null).map(() => Array(9).fill(0));
        const isValid = (board, row, col, num) => {
            for (let x = 0; x < 9; x++) {
                if (board[row][x] === num)
                    return false;
                if (board[x][col] === num)
                    return false;
            }
            const startRow = row - (row % 3);
            const startCol = col - (col % 3);
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[startRow + i][startCol + j] === num)
                        return false;
                }
            }
            return true;
        };
        const solve = (board) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isValid(board, row, col, num)) {
                                board[row][col] = num;
                                if (solve(board))
                                    return true;
                                board[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };
        solve(solution);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                puzzle[i][j] = solution[i][j];
            }
        }
        let cellsToRemove = 40;
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                cellsToRemove--;
            }
        }
        return { puzzle, solution };
    }
    displayBoard(board) {
        let display = '';
        for (let i = 0; i < 9; i++) {
            if (i % 3 === 0 && i !== 0)
                display += '------+-------+------\n';
            for (let j = 0; j < 9; j++) {
                if (j % 3 === 0 && j !== 0)
                    display += '| ';
                display += (board[i][j] === 0 ? '.' : board[i][j]) + ' ';
            }
            display += '\n';
        }
        return display;
    }
    async executeSlash(interaction) {
        const { puzzle, solution } = this.generatePuzzle();
        let attempts = 0;
        const maxAttempts = 50;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Sudoku`)
            .setColor(COLORS.info)
            .setDescription(`Fill in the empty cells (.) with numbers 1-9.\n\n\`\`\`\n${this.displayBoard(puzzle)}\n\`\`\`\n\nFormat: row,col,number (e.g., 0,0,5)`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 600000,
        });
        collector?.on('collect', async (m) => {
            const parts = m.content.split(',').map((p) => parseInt(p.trim()));
            if (parts.length !== 3 || parts.some((p) => isNaN(p) || p < 0 || p > 8 || (parts[2] < 1 || parts[2] > 9))) {
                await m.reply('Invalid format. Use: row,col,number (0-8, 0-8, 1-9)');
                return;
            }
            const [row, col, num] = parts;
            attempts++;
            if (solution[row][col] === num) {
                puzzle[row][col] = num;
                let isComplete = true;
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (puzzle[i][j] === 0) {
                            isComplete = false;
                            break;
                        }
                    }
                }
                if (isComplete) {
                    const winEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} You Won!`)
                        .setColor(COLORS.success)
                        .setDescription(`You completed the Sudoku in ${attempts} moves!`)
                        .setTimestamp();
                    await interaction.editReply({ embeds: [winEmbed] });
                    collector.stop();
                }
                else {
                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} Sudoku`)
                        .setColor(COLORS.info)
                        .setDescription(`\`\`\`\n${this.displayBoard(puzzle)}\n\`\`\`\n\nMoves: ${attempts}`)
                        .setTimestamp();
                    await interaction.editReply({ embeds: [updateEmbed] });
                }
            }
            else {
                await m.reply('Wrong number for that cell. Try again!');
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('Game timed out.')
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const { puzzle, solution } = this.generatePuzzle();
        let attempts = 0;
        const maxAttempts = 50;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Sudoku`)
            .setColor(COLORS.info)
            .setDescription(`Fill in the empty cells (.) with numbers 1-9.\n\n\`\`\`\n${this.displayBoard(puzzle)}\n\`\`\`\n\nFormat: row,col,number (e.g., 0,0,5)`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 600000,
        });
        collector.on('collect', async (m) => {
            const parts = m.content.split(',').map((p) => parseInt(p.trim()));
            if (parts.length !== 3 || parts.some((p) => isNaN(p) || p < 0 || p > 8 || (parts[2] < 1 || parts[2] > 9))) {
                await m.reply('Invalid format. Use: row,col,number (0-8, 0-8, 1-9)');
                return;
            }
            const [row, col, num] = parts;
            attempts++;
            if (solution[row][col] === num) {
                puzzle[row][col] = num;
                let isComplete = true;
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (puzzle[i][j] === 0) {
                            isComplete = false;
                            break;
                        }
                    }
                }
                if (isComplete) {
                    const winEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} You Won!`)
                        .setColor(COLORS.success)
                        .setDescription(`You completed the Sudoku in ${attempts} moves!`)
                        .setTimestamp();
                    await message.edit({ embeds: [winEmbed] });
                    collector.stop();
                }
                else {
                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} Sudoku`)
                        .setColor(COLORS.info)
                        .setDescription(`\`\`\`\n${this.displayBoard(puzzle)}\n\`\`\`\n\nMoves: ${attempts}`)
                        .setTimestamp();
                    await message.edit({ embeds: [updateEmbed] });
                }
            }
            else {
                await m.reply('Wrong number for that cell. Try again!');
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('Game timed out.')
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default SudokuGameCommand;
