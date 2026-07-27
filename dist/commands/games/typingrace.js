// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class TypeRaceCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'typingrace',
            description: 'Type the displayed text as fast as you can',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['typerace', 'speedtype'],
            examples: ['/typingrace', 'p!typingrace'],
        };
        super(options);
    }
    texts = [
        'The quick brown fox jumps over the lazy dog',
        'A journey of a thousand miles begins with a single step',
        'To be or not to be that is the question',
        'All that glitters is not gold',
        'The only thing we have to fear is fear itself',
    ];
    async executeSlash(interaction) {
        const text = this.texts[Math.floor(Math.random() * this.texts.length)];
        const startTime = Date.now();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Type Race`)
            .setColor(COLORS.info)
            .setDescription(`Type this text as fast as you can:\n\n"${text}"`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;
            const wpm = Math.round((text.split(' ').length / timeTaken) * 60);
            const accuracy = this.calculateAccuracy(m.content, text);
            const resultEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.games} Type Race Results`)
                .setColor(COLORS.info)
                .setDescription(`Time: ${timeTaken.toFixed(2)}s\nWPM: ${wpm}\nAccuracy: ${accuracy}%`)
                .addFields([
                { name: 'Original', value: text, inline: false },
                { name: 'Your text', value: m.content, inline: false },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [resultEmbed] });
            collector.stop();
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('You didn\'t type the text in time.')
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const text = this.texts[Math.floor(Math.random() * this.texts.length)];
        const startTime = Date.now();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Type Race`)
            .setColor(COLORS.info)
            .setDescription(`Type this text as fast as you can:\n\n"${text}"`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;
            const wpm = Math.round((text.split(' ').length / timeTaken) * 60);
            const accuracy = this.calculateAccuracy(m.content, text);
            const resultEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.games} Type Race Results`)
                .setColor(COLORS.info)
                .setDescription(`Time: ${timeTaken.toFixed(2)}s\nWPM: ${wpm}\nAccuracy: ${accuracy}%`)
                .addFields([
                { name: 'Original', value: text, inline: false },
                { name: 'Your text', value: m.content, inline: false },
            ])
                .setTimestamp();
            await message.edit({ embeds: [resultEmbed] });
            collector.stop();
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('You didn\'t type the text in time.')
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
    calculateAccuracy(userText, originalText) {
        const userWords = userText.split(' ');
        const originalWords = originalText.split(' ');
        let correct = 0;
        for (let i = 0; i < Math.min(userWords.length, originalWords.length); i++) {
            if (userWords[i].toLowerCase() === originalWords[i].toLowerCase()) {
                correct++;
            }
        }
        return Math.round((correct / originalWords.length) * 100);
    }
}
export default TypeRaceCommand;
