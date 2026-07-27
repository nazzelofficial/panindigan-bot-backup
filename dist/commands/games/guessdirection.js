// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessDirectionCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guessdirection',
            description: 'Guess the direction from a description',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['directionquiz'],
            examples: ['/guessdirection', 'p!guessdirection'],
        };
        super(options);
    }
    directions = [
        { description: 'I am where the sun rises', direction: 'East' },
        { description: 'I am where the sun sets', direction: 'West' },
        { description: 'I am towards the North Pole', direction: 'North' },
        { description: 'I am towards the South Pole', direction: 'South' },
    ];
    async executeSlash(interaction) {
        const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Direction`)
            .setColor(COLORS.info)
            .setDescription(`Guess the direction from this description:\n\n"${direction.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === direction.direction.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The direction was ${direction.direction}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The direction was ${direction.direction}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Direction`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${direction.description}"`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The direction was ${direction.direction}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Direction`)
            .setColor(COLORS.info)
            .setDescription(`Guess the direction from this description:\n\n"${direction.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === direction.direction.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The direction was ${direction.direction}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The direction was ${direction.direction}.`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Direction`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${direction.description}"`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The direction was ${direction.direction}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default GuessDirectionCommand;
