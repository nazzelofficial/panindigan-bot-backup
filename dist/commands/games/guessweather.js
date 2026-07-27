// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessWeatherCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guessweather',
            description: 'Guess the weather condition from a description',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['weatherquiz'],
            examples: ['/guessweather', 'p!guessweather'],
        };
        super(options);
    }
    weather = [
        { description: 'I fall from the sky in drops', weather: 'Rain' },
        { description: 'I am white and fall from the sky in flakes', weather: 'Snow' },
        { description: 'I appear in the sky during a storm', weather: 'Lightning' },
        { description: 'I am a loud sound during a storm', weather: 'Thunder' },
        { description: 'I appear as white fluffy things in the sky', weather: 'Clouds' },
    ];
    async executeSlash(interaction) {
        const condition = this.weather[Math.floor(Math.random() * this.weather.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Weather`)
            .setColor(COLORS.info)
            .setDescription(`Guess the weather condition from this description:\n\n"${condition.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === condition.weather.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The weather condition was ${condition.weather}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The weather condition was ${condition.weather}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Weather`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${condition.description}"`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The weather condition was ${condition.weather}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const condition = this.weather[Math.floor(Math.random() * this.weather.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Weather`)
            .setColor(COLORS.info)
            .setDescription(`Guess the weather condition from this description:\n\n"${condition.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === condition.weather.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The weather condition was ${condition.weather}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The weather condition was ${condition.weather}.`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Weather`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${condition.description}"`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The weather condition was ${condition.weather}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default GuessWeatherCommand;
