import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SummarizeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'summarize',
      description: 'Summarize text using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['summary', 'sum'],
      examples: ['/summarize long text here', 'p!summarize long text here'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to summarize.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📝 AI Summary`)
      .setColor(COLORS.info)
      .setDescription(`Original text length: ${text.length} characters`)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Summary', value: 'This is a placeholder. AI summarization will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const text = args.join(' ');

    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to summarize.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📝 AI Summary`)
      .setColor(COLORS.info)
      .setDescription(`Original text length: ${text.length} characters`)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Summary', value: 'This is a placeholder. AI summarization will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SummarizeCommand;
