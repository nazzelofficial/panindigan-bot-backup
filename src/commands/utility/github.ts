// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GithubCommand extends BaseCommand {
  constructor() {
    super({ name: 'github', description: 'Look up a GitHub repository', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['ghrepo', 'repo'], examples: ['/github microsoft/vscode', 'p!github discord/discord-api-docs'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, query: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!query || !query.includes('/')) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a repo in format `owner/repo`'));
    try {
      const resp = await fetch(`https://api.github.com/repos/${query}`, { headers: { 'User-Agent': 'PanindiganBot/1.0' }, signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Repository \`${query}\` not found.`));
      const data = await resp.json() as any;
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📦 ${data.full_name}`)
        .setURL(data.html_url)
        .setDescription(data.description ?? 'No description.')
        .setThumbnail(data.owner.avatar_url)
        .addFields(
          { name: '⭐ Stars', value: data.stargazers_count.toLocaleString(), inline: true },
          { name: '🍴 Forks', value: data.forks_count.toLocaleString(), inline: true },
          { name: '👁️ Watchers', value: data.watchers_count.toLocaleString(), inline: true },
          { name: '💻 Language', value: data.language ?? 'N/A', inline: true },
          { name: '🐛 Issues', value: data.open_issues_count.toLocaleString(), inline: true },
          { name: '📄 License', value: data.license?.name ?? 'None', inline: true },
        ).setFooter({ text: `Last updated: ${new Date(data.updated_at).toDateString()}` });
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('repo', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default GithubCommand;
