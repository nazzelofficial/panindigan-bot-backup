import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UrbanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'urban',
      description: 'Search Urban Dictionary for a term',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['urbandictionary', 'ud'],
      examples: ['/urban yeet', 'p!urban sus'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('term').setDescription('Term to look up').setRequired(true)) as SlashCommandBuilder;
  }

  private async lookup(term: string): Promise<{ definition: string; example: string; author: string; thumbsUp: number; thumbsDown: number; link: string } | null> {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Urban Dictionary API error: ${res.status}`);
    const data: any = await res.json();
    if (!data.list?.length) return null;
    const entry = data.list[0];
    return {
      definition: entry.definition?.replace(/\[([^\]]+)\]/g, '$1') || 'No definition.',
      example: entry.example?.replace(/\[([^\]]+)\]/g, '$1') || 'No example.',
      author: entry.author || 'Unknown',
      thumbsUp: entry.thumbs_up || 0,
      thumbsDown: entry.thumbs_down || 0,
      link: entry.permalink || `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(term)}`,
    };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const term = interaction.options.getString('term', true);
    await interaction.deferReply();
    try {
      const result = await this.lookup(term);
      if (!result) {
        await interaction.editReply({ content: `${EMOJIS.error} No definition found for **${term}**.` });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📖 Urban Dictionary: ${term}`)
        .setColor(0x1d3461)
        .setURL(result.link)
        .addFields(
          { name: '📝 Definition', value: result.definition.slice(0, 1024), inline: false },
          { name: '💬 Example', value: result.example.slice(0, 512) || 'No example.', inline: false },
          { name: '👤 Author', value: result.author, inline: true },
          { name: '👍', value: result.thumbsUp.toLocaleString(), inline: true },
          { name: '👎', value: result.thumbsDown.toLocaleString(), inline: true },
        )
        .setFooter({ text: 'Urban Dictionary' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch definition.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const term = args.join(' ');
    if (!term) return void message.reply(`${EMOJIS.error} Please provide a term to look up.`);
    const thinking = await message.reply(`${EMOJIS.info} Searching Urban Dictionary...`);
    try {
      const result = await this.lookup(term);
      if (!result) {
        await thinking.edit(`${EMOJIS.error} No definition found for **${term}**.`);
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📖 Urban Dictionary: ${term}`)
        .setColor(0x1d3461)
        .setURL(result.link)
        .addFields(
          { name: '📝 Definition', value: result.definition.slice(0, 1024), inline: false },
          { name: '💬 Example', value: result.example.slice(0, 512) || 'No example.', inline: false },
        )
        .setFooter({ text: `👍 ${result.thumbsUp} | 👎 ${result.thumbsDown} | by ${result.author}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch definition.'}`);
    }
  }
}

export default UrbanCommand;
