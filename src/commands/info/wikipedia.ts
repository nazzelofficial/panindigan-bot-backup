import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WikipediaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wikipedia',
      description: 'Search Wikipedia for information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wiki'],
      examples: ['/wikipedia Discord', 'p!wikipedia Python'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query') || '';
    if (!query) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a search query.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📚 Wikipedia: ${query}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Wikipedia search will be implemented with the Wikipedia API.')
      .addFields([
        { name: 'Summary', value: 'N/A', inline: false },
        { name: 'URL', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const query = args.join(' ');

    if (!query) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a search query.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📚 Wikipedia: ${query}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Wikipedia search will be implemented with the Wikipedia API.')
      .addFields([
        { name: 'Summary', value: 'N/A', inline: false },
        { name: 'URL', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WikipediaCommand;
