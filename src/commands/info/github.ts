import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GithubCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'github',
      description: 'Look up a GitHub user or repository',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gh'],
      examples: ['/github user:torvalds', '/github repo:discord/discord-api-docs', 'p!github microsoft/vscode'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('username or owner/repo').setRequired(true)) as SlashCommandBuilder;
  }

  private async fetchUser(username: string): Promise<EmbedBuilder> {
    const res = await fetch(`https://api.github.com/users/${username}`, { headers: { 'User-Agent': 'Panindigan-Bot/1.0' } });
    if (!res.ok) throw new Error(res.status === 404 ? `User "${username}" not found.` : `GitHub API error: ${res.status}`);
    const u: any = await res.json();
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🐙 GitHub: ${u.login}`)
      .setColor(0x171515)
      .setURL(u.html_url)
      .setThumbnail(u.avatar_url)
      .addFields(
        { name: '📛 Name', value: u.name || 'N/A', inline: true },
        { name: '🏢 Company', value: u.company || 'N/A', inline: true },
        { name: '📍 Location', value: u.location || 'N/A', inline: true },
        { name: '👥 Followers', value: u.followers?.toLocaleString() || '0', inline: true },
        { name: '➡️ Following', value: u.following?.toLocaleString() || '0', inline: true },
        { name: '📦 Public Repos', value: u.public_repos?.toLocaleString() || '0', inline: true },
        ...(u.bio ? [{ name: '📄 Bio', value: u.bio.slice(0, 256), inline: false }] : []),
        { name: '📅 Joined', value: new Date(u.created_at).toDateString(), inline: true },
      )
      .setFooter({ text: 'GitHub API' })
      .setTimestamp();
  }

  private async fetchRepo(ownerRepo: string): Promise<EmbedBuilder> {
    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, { headers: { 'User-Agent': 'Panindigan-Bot/1.0' } });
    if (!res.ok) throw new Error(res.status === 404 ? `Repository "${ownerRepo}" not found.` : `GitHub API error: ${res.status}`);
    const r: any = await res.json();
    return new EmbedBuilder()
      .setTitle(`🐙 ${r.full_name}`)
      .setColor(0x171515)
      .setURL(r.html_url)
      .setDescription(r.description?.slice(0, 256) || 'No description.')
      .addFields(
        { name: '⭐ Stars', value: r.stargazers_count?.toLocaleString() || '0', inline: true },
        { name: '🔀 Forks', value: r.forks_count?.toLocaleString() || '0', inline: true },
        { name: '👁️ Watchers', value: r.watchers_count?.toLocaleString() || '0', inline: true },
        { name: '🐛 Issues', value: r.open_issues_count?.toLocaleString() || '0', inline: true },
        { name: '📝 Language', value: r.language || 'N/A', inline: true },
        { name: '📄 License', value: r.license?.spdx_id || 'None', inline: true },
        { name: '📅 Updated', value: new Date(r.updated_at).toDateString(), inline: false },
      )
      .setFooter({ text: `GitHub | ${r.private ? '🔒 Private' : '🌍 Public'}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true).trim();
    await interaction.deferReply();
    try {
      const isRepo = query.includes('/');
      const embed = isRepo ? await this.fetchRepo(query) : await this.fetchUser(query);
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'GitHub API error.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join('').trim();
    if (!query) return void message.reply(`${EMOJIS.error} Please provide a GitHub username or owner/repo.`);
    const thinking = await message.reply(`${EMOJIS.info} Fetching GitHub data...`);
    try {
      const isRepo = query.includes('/');
      const embed = isRepo ? await this.fetchRepo(query) : await this.fetchUser(query);
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'GitHub API error.'}`);
    }
  }
}

export default GithubCommand;
