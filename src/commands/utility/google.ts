import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GoogleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'google',
      description: 'Search Google and display the top results',
      category: 'utility',
      premiumTier: 'gold',
      cooldown: 10,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['search', 'g', 'googlesearch'],
      examples: ['/google TypeScript tutorial', 'p!google Discord.js v14'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('query').setDescription('What to search for').setRequired(true)
      )
    ) as SlashCommandBuilder;
  }

  private buildEmbed(query: string): EmbedBuilder {
    const encoded = encodeURIComponent(query);
    const googleUrl = `https://www.google.com/search?q=${encoded}`;

    // Since we don't have a Google Search API key by default,
    // we provide a direct link and DDG fallback results format
    return new EmbedBuilder()
      .setTitle(`🔍 Google Search: ${query.slice(0, 50)}`)
      .setColor(COLORS.info)
      .setDescription(
        `🔗 **[Click to search Google](${googleUrl})**\n\n` +
        `**Related searches:**\n` +
        `• [${query} tutorial](https://www.google.com/search?q=${encoded}+tutorial)\n` +
        `• [${query} examples](https://www.google.com/search?q=${encoded}+examples)\n` +
        `• [${query} documentation](https://www.google.com/search?q=${encoded}+documentation)\n` +
        `• [${query} GitHub](https://www.google.com/search?q=${encoded}+site:github.com)\n\n` +
        `💡 **Tip:** You can also use the DuckDuckGo bang `+
        `[\`!g ${query}\`](https://duckduckgo.com/?q=!g+${encoded}) for instant Google redirect.`
      )
      .addFields(
        { name: '🔗 Direct Link', value: `[Open in Google](${googleUrl})`, inline: true },
        { name: '🦆 Alternative', value: `[DuckDuckGo](https://duckduckgo.com/?q=${encoded})`, inline: true },
        { name: '📚 Wikipedia', value: `[Search Wiki](https://en.wikipedia.org/w/index.php?search=${encoded})`, inline: true },
      )
      .setFooter({ text: 'Gold tier feature • Results open in your browser' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.reply({ embeds: [this.buildEmbed(query)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join(' ');
    if (!query) {
      await message.reply(`${EMOJIS.error} Please provide a search query.\nExample: \`p!google TypeScript tutorial\``);
      return;
    }
    await message.reply({ embeds: [this.buildEmbed(query)] });
  }
}

export default GoogleCommand;
