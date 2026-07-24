import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GithubCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'github',
      description: 'Get information about a GitHub user or repository',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/github username', '/github username/repo', 'p!github username'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query');
    
    if (!query) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a GitHub username or repository.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🐙 GitHub: ${query}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. GitHub information will be implemented with GitHub API.')
      .addFields([
        { name: 'Query', value: query, inline: true },
        { name: 'Status', value: 'API integration pending', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const query = args[0];

    if (!query) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a GitHub username or repository.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🐙 GitHub: ${query}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. GitHub information will be implemented with GitHub API.')
      .addFields([
        { name: 'Query', value: query, inline: true },
        { name: 'Status', value: 'API integration pending', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GithubCommand;
