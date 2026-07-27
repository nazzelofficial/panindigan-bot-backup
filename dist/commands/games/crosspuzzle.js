// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CrossPuzzleCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'crosspuzzle',
            description: 'Solve a crossword puzzle (simplified)',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['crossword'],
            examples: ['/crosspuzzle', 'p!crosspuzzle'],
        };
        super(options);
    }
    clues = [
        { clue: 'The largest planet in our solar system', answer: 'JUPITER' },
        { clue: 'A fruit that is yellow and curved', answer: 'BANANA' },
        { clue: 'The capital of France', answer: 'PARIS' },
        { clue: 'A cold treat made from milk', answer: 'ICECREAM' },
    ];
    async executeSlash(interaction) {
        const clue = this.clues[Math.floor(Math.random() * this.clues.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Crossword Puzzle`)
            .setColor(COLORS.info)
            .setDescription(`Clue: ${clue.clue}\n\nAnswer: _ _ _ _ _ _ _\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            attempts++;
            if (m.content.toUpperCase() === clue.answer) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Correct!`)
                    .setColor(COLORS.success)
                    .setDescription(`The answer was ${clue.answer}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The answer was ${clue.answer}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Crossword Puzzle`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nClue: ${clue.clue}\n\nAnswer: _ _ _ _ _ _ _`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The answer was ${clue.answer}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const clue = this.clues[Math.floor(Math.random() * this.clues.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Crossword Puzzle`)
            .setColor(COLORS.info)
            .setDescription(`Clue: ${clue.clue}\n\nAnswer: _ _ _ _ _ _ _\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            attempts++;
            if (m.content.toUpperCase() === clue.answer) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Correct!`)
                    .setColor(COLORS.success)
                    .setDescription(`The answer was ${clue.answer}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The answer was ${clue.answer}.`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Crossword Puzzle`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\nClue: ${clue.clue}\n\nAnswer: _ _ _ _ _ _ _`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The answer was ${clue.answer}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default CrossPuzzleCommand;
