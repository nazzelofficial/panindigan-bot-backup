import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WikipediaUtilityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wikipedia',
      description: 'Search Wikipedia',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['wiki'],
      examples: ['p!wikipedia Discord'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/wikipedia` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join(' ');
    if (!query) return void message.reply(`${EMOJIS.error} Please provide a search query.`);
    const thinking = await message.reply(`${EMOJIS.info} Searching Wikipedia...`);
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Panindigan-Bot/1.0' } });
      if (!res.ok) { await thinking.edit(`${EMOJIS.error} No article found for **${query}**.`); return; }
      const data: any = await res.json();
      const embed = new EmbedBuilder()
        .setTitle(`📚 ${data.title}`)
        .setColor(COLORS.info)
        .setURL(data.content_urls?.desktop?.page || '')
        .setDescription(data.extract?.slice(0, 4000) || 'No summary.')
        .setTimestamp();
      if (data.thumbnail?.source) embed.setThumbnail(data.thumbnail.source);
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed.'}`);
    }
  }
}

export default WikipediaUtilityCommand;
