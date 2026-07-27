// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessColorCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guesscolor',
            description: 'Guess the color from a description',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['colorquiz'],
            examples: ['/guesscolor', 'p!guesscolor'],
        };
        super(options);
    }
    colors = [
        { description: 'I am the color of the sky on a clear day', color: 'Blue' },
        { description: 'I am the color of grass and leaves', color: 'Green' },
        { description: 'I am the color of the sun and fire', color: 'Yellow' },
        { description: 'I am the color of roses and love', color: 'Red' },
        { description: 'I am the color of royalty and mystery', color: 'Purple' },
    ];
    async executeSlash(interaction) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Color`)
            .setColor(COLORS.info)
            .setDescription(`Guess the color from this description:\n\n"${color.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === color.color.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The color was ${color.color}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The color was ${color.color}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Color`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${color.description}"`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The color was ${color.color}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Color`)
            .setColor(COLORS.info)
            .setDescription(`Guess the color from this description:\n\n"${color.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === color.color.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The color was ${color.color}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The color was ${color.color}.`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Color`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${color.description}"`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The color was ${color.color}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default GuessColorCommand;
