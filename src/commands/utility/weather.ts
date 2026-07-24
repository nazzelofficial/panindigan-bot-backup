import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { weatherService } from '../../services/WeatherService';

export class WeatherUtilityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'weather',
      description: 'Display weather information for a location',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: [],
      examples: ['p!weather Manila'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/weather` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const location = args.join(' ');
    if (!location) return void message.reply(`${EMOJIS.error} Please provide a location.`);
    const thinking = await message.reply(`${EMOJIS.info} Fetching weather...`);
    try {
      const data = await weatherService.getCurrentWeather(location);
      const emoji = weatherService.getWeatherEmoji(data.description);
      const embed = new EmbedBuilder()
        .setTitle(`${emoji} Weather — ${data.city}, ${data.country}`)
        .setColor(COLORS.info)
        .addFields(
          { name: '🌡️ Temperature', value: `${data.temperature}°C (feels like ${data.feelsLike}°C)`, inline: true },
          { name: '💧 Humidity', value: `${data.humidity}%`, inline: true },
          { name: '💨 Wind', value: `${data.windSpeed} km/h`, inline: true },
          { name: '🌤️ Condition', value: data.description, inline: true },
        )
        .setThumbnail(data.iconUrl)
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch weather.'}`);
    }
  }
}

export default WeatherUtilityCommand;
