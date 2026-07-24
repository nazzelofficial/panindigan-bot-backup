import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { newsService } from '../../services/NewsService';

export class NewsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'news',
      description: 'Get the latest news headlines',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['headlines'],
      examples: ['/news', '/news tech', 'p!news Philippines'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('Search topic (leave blank for top headlines)').setRequired(false))
      .addStringOption(o => o.setName('category').setDescription('News category').setRequired(false)
        .addChoices(
          { name: 'General', value: 'general' },
          { name: 'Technology', value: 'technology' },
          { name: 'Business', value: 'business' },
          { name: 'Science', value: 'science' },
          { name: 'Sports', value: 'sports' },
          { name: 'Entertainment', value: 'entertainment' },
          { name: 'Health', value: 'health' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query');
    const category = interaction.options.getString('category') || undefined;
    await interaction.deferReply();
    try {
      if (!newsService.isConfigured()) {
        await interaction.editReply({ content: `${EMOJIS.error} News service not configured. Set \`NEWS_API_KEY\` in environment variables.` });
        return;
      }
      const articles = query
        ? await newsService.searchNews(query, 5)
        : await newsService.getTopHeadlines('us', category, 5);
      if (!articles.length) {
        await interaction.editReply({ content: `${EMOJIS.error} No news articles found.` });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📰 ${query ? `News: ${query}` : `Top Headlines${category ? ` — ${category}` : ''}`}`)
        .setColor(COLORS.info)
        .setDescription(articles.map((a, i) =>
          `**${i + 1}. [${a.title}](${a.url})**\n${a.description?.slice(0, 100) || ''}...\n📰 ${a.source} • ${newsService.formatTimeAgo(a.publishedAt)}`
        ).join('\n\n').slice(0, 4000))
        .setThumbnail(articles[0].imageUrl || null)
        .setFooter({ text: 'NewsAPI.org' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch news.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join(' ') || undefined;
    const thinking = await message.reply(`${EMOJIS.info} Fetching news...`);
    try {
      if (!newsService.isConfigured()) {
        await thinking.edit(`${EMOJIS.error} News service not configured. Set \`NEWS_API_KEY\`.`);
        return;
      }
      const articles = query ? await newsService.searchNews(query, 5) : await newsService.getTopHeadlines('us', undefined, 5);
      if (!articles.length) { await thinking.edit(`${EMOJIS.error} No news articles found.`); return; }
      const embed = new EmbedBuilder()
        .setTitle(`📰 ${query ? `News: ${query}` : 'Top Headlines'}`)
        .setColor(COLORS.info)
        .setDescription(articles.map((a, i) =>
          `**${i + 1}. [${a.title}](${a.url})**\n📰 ${a.source} • ${newsService.formatTimeAgo(a.publishedAt)}`
        ).join('\n\n').slice(0, 4000))
        .setFooter({ text: 'NewsAPI.org' })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch news.'}`);
    }
  }
}

export default NewsCommand;
