import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GithubCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'github',
      description: 'Get information about a GitHub user or repository',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gh'],
      examples: ['/github username', '/github username/repo', 'p!github username'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query') || '';
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
      .setDescription('This is a placeholder. GitHub information will be implemented with the GitHub API.')
      .addFields([
        { name: 'User/Repo', value: query, inline: false },
        { name: 'Information', value: 'N/A', inline: false },
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
        .setDescription('Please provide a GitHub username or repository.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🐙 GitHub: ${query}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. GitHub information will be implemented with the GitHub API.')
      .addFields([
        { name: 'User/Repo', value: query, inline: false },
        { name: 'Information', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GithubCommand;
