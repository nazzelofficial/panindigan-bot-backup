import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RewriteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rewrite',
      description: 'Rewrite text using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['paraphrase', 'rephrase'],
      examples: ['/rewrite make this more formal', 'p!rewrite make this shorter'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    const style = interaction.options.getString('style') || 'neutral';

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to rewrite.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✍️ AI Rewrite`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Style', value: style, inline: true },
        { name: 'Rewritten', value: 'This is a placeholder. AI rewriting will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const text = args.slice(0, -1).join(' ');
    const style = args[args.length - 1] || 'neutral';

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to rewrite.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✍️ AI Rewrite`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Style', value: style, inline: true },
        { name: 'Rewritten', value: 'This is a placeholder. AI rewriting will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RewriteCommand;
