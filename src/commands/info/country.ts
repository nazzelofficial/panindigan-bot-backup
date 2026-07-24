import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CountryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'country',
      description: 'Get information about a country',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/country Philippines', '/country Japan', 'p!country USA'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const country = interaction.options.getString('country') || '';
    if (!country) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a country name.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌍 Country: ${country}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Country information will be implemented with a country API.')
      .addFields([
        { name: 'Name', value: country, inline: true },
        { name: 'Capital', value: 'N/A', inline: true },
        { name: 'Population', value: 'N/A', inline: true },
        { name: 'Region', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const country = args.join(' ');

    if (!country) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a country name.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌍 Country: ${country}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Country information will be implemented with a country API.')
      .addFields([
        { name: 'Name', value: country, inline: true },
        { name: 'Capital', value: 'N/A', inline: true },
        { name: 'Population', value: 'N/A', inline: true },
        { name: 'Region', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CountryCommand;
