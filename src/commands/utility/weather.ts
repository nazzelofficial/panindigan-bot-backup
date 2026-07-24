import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WeatherCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'weather',
      description: 'Get weather information for a location',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/weather Manila', '/weather Tokyo', 'p!weather New York'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const location = interaction.options.getString('location');
    
    if (!location) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a location.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌤️ Weather: ${location}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Weather information will be implemented with a weather API.')
      .addFields([
        { name: 'Location', value: location, inline: true },
        { name: 'Temperature', value: 'N/A', inline: true },
        { name: 'Condition', value: 'N/A', inline: true },
        { name: 'Humidity', value: 'N/A', inline: true },
        { name: 'Wind', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const location = args.join(' ');

    if (!location) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a location.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌤️ Weather: ${location}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Weather information will be implemented with a weather API.')
      .addFields([
        { name: 'Location', value: location, inline: true },
        { name: 'Temperature', value: 'N/A', inline: true },
        { name: 'Condition', value: 'N/A', inline: true },
        { name: 'Humidity', value: 'N/A', inline: true },
        { name: 'Wind', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WeatherCommand;
