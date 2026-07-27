// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

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
      examples: ['/wikipedia Discord', 'p!wikipedia Python programming'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)) as SlashCommandBuilder;
  }

  private async search(query: string): Promise<{ title: string; extract: string; url: string; thumbnail?: string } | null> {
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Panindigan-Bot/1.0' } });
    if (res.status === 404) {
      // Try search API
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`);
      const searchData: any = await searchRes.json();
      if (!searchData[1]?.length) return null;
      const title = searchData[1][0];
      const res2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
      if (!res2.ok) return null;
      const data2: any = await res2.json();
      return {
        title: data2.title,
        extract: data2.extract || 'No summary available.',
        url: data2.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        thumbnail: data2.thumbnail?.source,
      };
    }
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
    const data: any = await res.json();
    return {
      title: data.title,
      extract: data.extract || 'No summary available.',
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      thumbnail: data.thumbnail?.source,
    };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.deferReply();
    try {
      const result = await this.search(query);
      if (!result) {
        await interaction.editReply({ content: `${EMOJIS.error} No Wikipedia article found for **${query}**.` });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📚 ${result.title}`)
        .setColor(COLORS.info)
        .setURL(result.url)
        .setDescription(result.extract.slice(0, 4000))
        .setFooter({ text: '📖 Wikipedia' })
        .setTimestamp();
      if (result.thumbnail) embed.setThumbnail(result.thumbnail);
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch Wikipedia article.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const query = _args.join(' ');
    if (!query) return void message.reply(`${EMOJIS.error} Please provide a search query.`);
    const thinking = await message.reply(`${EMOJIS.info} Searching Wikipedia...`);
    try {
      const result = await this.search(query);
      if (!result) {
        await thinking.edit(`${EMOJIS.error} No Wikipedia article found for **${query}**.`);
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📚 ${result.title}`)
        .setColor(COLORS.info)
        .setURL(result.url)
        .setDescription(result.extract.slice(0, 4000))
        .setFooter({ text: '📖 Wikipedia' })
        .setTimestamp();
      if (result.thumbnail) embed.setThumbnail(result.thumbnail);
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch Wikipedia article.'}`);
    }
  }
}

export default WikipediaCommand;
