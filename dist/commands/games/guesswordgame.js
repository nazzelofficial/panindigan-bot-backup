// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessWordGameCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guesswordgame',
            description: 'Guess the hidden word letter by letter',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['wordguess'],
            examples: ['/guesswordgame', 'p!guesswordgame'],
        };
        super(options);
    }
    words = ['apple', 'banana', 'orange', 'grape', 'mango', 'peach', 'cherry', 'lemon', 'melon', 'berry'];
    async executeSlash(interaction) {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const guessedLetters = new Set();
        let attempts = 0;
        const maxAttempts = 6;
        const getDisplayWord = () => {
            return word.split('').map((letter) => (guessedLetters.has(letter) ? letter : '_')).join(' ');
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Word`)
            .setColor(COLORS.info)
            .setDescription(`Word: ${getDisplayWord()}\n\nGuess a letter! Attempts left: ${maxAttempts - attempts}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 120000,
        });
        collector?.on('collect', async (m) => {
            const guess = m.content.toLowerCase();
            if (guess.length !== 1 || !/[a-z]/.test(guess)) {
                await m.reply('Please guess a single letter.');
                return;
            }
            if (guessedLetters.has(guess)) {
                await m.reply('You already guessed that letter.');
                return;
            }
            guessedLetters.add(guess);
            attempts++;
            const displayWord = getDisplayWord();
            if (!displayWord.includes('_')) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The word was "${word}". You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The word was "${word}".`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Word`)
                    .setColor(COLORS.info)
                    .setDescription(`Word: ${displayWord}\n\nGuessed: ${Array.from(guessedLetters).join(', ')}\nAttempts left: ${maxAttempts - attempts}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The word was "${word}".`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const guessedLetters = new Set();
        let attempts = 0;
        const maxAttempts = 6;
        const getDisplayWord = () => {
            return word.split('').map((letter) => (guessedLetters.has(letter) ? letter : '_')).join(' ');
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Word`)
            .setColor(COLORS.info)
            .setDescription(`Word: ${getDisplayWord()}\n\nGuess a letter! Attempts left: ${maxAttempts - attempts}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 120000,
        });
        collector.on('collect', async (m) => {
            const guess = m.content.toLowerCase();
            if (guess.length !== 1 || !/[a-z]/.test(guess)) {
                await m.reply('Please guess a single letter.');
                return;
            }
            if (guessedLetters.has(guess)) {
                await m.reply('You already guessed that letter.');
                return;
            }
            guessedLetters.add(guess);
            attempts++;
            const displayWord = getDisplayWord();
            if (!displayWord.includes('_')) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The word was "${word}". You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The word was "${word}".`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Word`)
                    .setColor(COLORS.info)
                    .setDescription(`Word: ${displayWord}\n\nGuessed: ${Array.from(guessedLetters).join(', ')}\nAttempts left: ${maxAttempts - attempts}`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The word was "${word}".`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default GuessWordGameCommand;
