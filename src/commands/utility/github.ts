import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GithubUtilityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'github',
      description: 'Look up a GitHub user or repository',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['gh'],
      examples: ['p!github torvalds', 'p!github microsoft/vscode'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/github` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join('').trim();
    if (!query) return void message.reply(`${EMOJIS.error} Please provide a GitHub username or owner/repo.`);
    const thinking = await message.reply(`${EMOJIS.info} Fetching GitHub data...`);
    try {
      const isRepo = query.includes('/');
      const url = isRepo
        ? `https://api.github.com/repos/${query}`
        : `https://api.github.com/users/${query}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Panindigan-Bot/1.0' } });
      if (!res.ok) { await thinking.edit(`${EMOJIS.error} Not found: ${query}`); return; }
      const data: any = await res.json();
      let embed: EmbedBuilder;
      if (isRepo) {
        embed = new EmbedBuilder()
          .setTitle(`🐙 ${data.full_name}`)
          .setColor(0x171515)
          .setURL(data.html_url)
          .setDescription(data.description || 'No description.')
          .addFields(
            { name: '⭐ Stars', value: `${data.stargazers_count?.toLocaleString()}`, inline: true },
            { name: '🔀 Forks', value: `${data.forks_count?.toLocaleString()}`, inline: true },
            { name: '📝 Language', value: data.language || 'N/A', inline: true },
          ).setTimestamp();
      } else {
        embed = new EmbedBuilder()
          .setTitle(`🐙 ${data.login}`)
          .setColor(0x171515)
          .setURL(data.html_url)
          .setThumbnail(data.avatar_url)
          .addFields(
            { name: '👥 Followers', value: `${data.followers?.toLocaleString()}`, inline: true },
            { name: '📦 Repos', value: `${data.public_repos?.toLocaleString()}`, inline: true },
            ...(data.bio ? [{ name: '📄 Bio', value: data.bio.slice(0, 256), inline: false }] : []),
          ).setTimestamp();
      }
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed.'}`);
    }
  }
}

export default GithubUtilityCommand;
