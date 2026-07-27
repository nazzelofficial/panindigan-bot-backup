// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { weatherService } from '../../services/WeatherService.js';
export class WeatherCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'weather',
            description: 'Display weather information for a location',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/weather Manila', 'p!weather New York'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('location').setDescription('City name or location').setRequired(true));
    }
    async executeSlash(interaction) {
        const location = interaction.options.getString('location', true);
        await interaction.deferReply();
        try {
            const data = await weatherService.getCurrentWeather(location);
            const emoji = weatherService.getWeatherEmoji(data.description);
            const embed = new EmbedBuilder()
                .setTitle(`${emoji} Weather — ${data.city}, ${data.country}`)
                .setColor(COLORS.info)
                .addFields({ name: '🌡️ Temperature', value: `${data.temperature}°C (feels like ${data.feelsLike}°C)`, inline: true }, { name: '💧 Humidity', value: `${data.humidity}%`, inline: true }, { name: '💨 Wind', value: `${data.windSpeed} km/h`, inline: true }, { name: '🌤️ Condition', value: data.description.charAt(0).toUpperCase() + data.description.slice(1), inline: true }, ...(data.pressure ? [{ name: '🔽 Pressure', value: `${data.pressure} hPa`, inline: true }] : []), ...(data.visibility !== undefined ? [{ name: '👁️ Visibility', value: `${data.visibility} km`, inline: true }] : []), ...(data.sunrise && data.sunset ? [{
                    name: '🌅 Sunrise / Sunset',
                    value: `${new Date(data.sunrise * 1000).toLocaleTimeString()} / ${new Date(data.sunset * 1000).toLocaleTimeString()}`,
                    inline: false
                }] : []))
                .setThumbnail(data.iconUrl)
                .setFooter({ text: 'Data from OpenWeatherMap' })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            if (!weatherService.isConfigured()) {
                await interaction.editReply({ content: `${EMOJIS.error} Weather service not configured. Set \`WEATHER_API_KEY\` in environment.` });
            }
            else {
                await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch weather.'}` });
            }
        }
    }
    async executePrefix(message, _args) {
        const location = _args.join(' ');
        if (!location)
            return void message.reply(`${EMOJIS.error} Please provide a location.`);
        const thinking = await message.reply(`${EMOJIS.info} Fetching weather...`);
        try {
            const data = await weatherService.getCurrentWeather(location);
            const emoji = weatherService.getWeatherEmoji(data.description);
            const embed = new EmbedBuilder()
                .setTitle(`${emoji} Weather — ${data.city}, ${data.country}`)
                .setColor(COLORS.info)
                .addFields({ name: '🌡️ Temperature', value: `${data.temperature}°C (feels like ${data.feelsLike}°C)`, inline: true }, { name: '💧 Humidity', value: `${data.humidity}%`, inline: true }, { name: '💨 Wind', value: `${data.windSpeed} km/h`, inline: true }, { name: '🌤️ Condition', value: data.description.charAt(0).toUpperCase() + data.description.slice(1), inline: true })
                .setThumbnail(data.iconUrl)
                .setFooter({ text: 'Data from OpenWeatherMap' })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch weather.'}`);
        }
    }
}
export default WeatherCommand;
