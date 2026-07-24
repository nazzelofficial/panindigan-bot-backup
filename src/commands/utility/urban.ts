import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UrbanUtilityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'urban',
      description: 'Search Urban Dictionary',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['ud'],
      examples: ['p!urban yeet'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/urban` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const term = args.join(' ');
    if (!term) return void message.reply(`${EMOJIS.error} Please provide a term.`);
    const thinking = await message.reply(`${EMOJIS.info} Searching...`);
    try {
      const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`;
      const res = await fetch(url);
      const data: any = await res.json();
      const entry = data.list?.[0];
      if (!entry) { await thinking.edit(`${EMOJIS.error} No definition found for **${term}**.`); return; }
      const embed = new EmbedBuilder()
        .setTitle(`📖 Urban: ${term}`)
        .setColor(0x1d3461)
        .setURL(entry.permalink)
        .addFields(
          { name: '📝 Definition', value: (entry.definition?.replace(/\[([^\]]+)\]/g, '$1') || 'N/A').slice(0, 1024), inline: false },
          { name: '💬 Example', value: (entry.example?.replace(/\[([^\]]+)\]/g, '$1') || 'N/A').slice(0, 512), inline: false },
        )
        .setFooter({ text: `👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down} | by ${entry.author}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed.'}`);
    }
  }
}

export default UrbanUtilityCommand;
