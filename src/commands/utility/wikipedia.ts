import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WikipediaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wikipedia',
      description: 'Search Wikipedia for a topic summary',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wiki', 'wp'],
      examples: ['/wikipedia TypeScript', 'p!wiki quantum physics'],
    };
    super(options);
  }

  private async fetchSummary(topic: string): Promise<any | null> {
    try {
      const encoded = encodeURIComponent(topic.replace(/ /g, '_'));
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  private buildEmbed(data: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`📚 ${data.title}`)
      .setURL(data.content_urls?.desktop?.page || '')
      .setTimestamp();

    const extract = data.extract || 'No summary available.';
    embed.setDescription(extract.length > 4096 ? extract.slice(0, 4093) + '...' : extract);

    if (data.thumbnail?.source) {
      embed.setThumbnail(data.thumbnail.source);
    }

    embed.setFooter({ text: 'Source: Wikipedia' });
    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic', true);
    await interaction.deferReply();

    const data = await this.fetchSummary(topic);
    if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not Found`)
        .setDescription(`No Wikipedia article found for **${topic}**.`);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    await interaction.editReply({ embeds: [this.buildEmbed(data)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!wikipedia <topic>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const topic = args.join(' ');
    const msg = await message.reply({ content: `${EMOJIS.loading} Searching Wikipedia for **${topic}**...` });

    const data = await this.fetchSummary(topic);
    if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not Found`)
        .setDescription(`No Wikipedia article found for **${topic}**.`);
      await msg.edit({ content: '', embeds: [embed] });
      return;
    }

    await msg.edit({ content: '', embeds: [this.buildEmbed(data)] });
  }
}

export default WikipediaCommand;
