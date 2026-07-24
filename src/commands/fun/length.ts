import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LengthCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'length',
      description: 'Get the length of text',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['len', 'charcount'],
      examples: ['/length hello world', 'p!length hello world'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to count.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const length = text.length;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 📏 Text Length`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Text', value: text.substring(0, 100) + (text.length > 100 ? '...' : ''), inline: false },
        { name: 'Characters', value: length.toString(), inline: true },
        { name: 'Words', value: wordCount.toString(), inline: true },
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
        .setDescription('Please provide text to count.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const length = text.length;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 📏 Text Length`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Text', value: text.substring(0, 100) + (text.length > 100 ? '...' : ''), inline: false },
        { name: 'Characters', value: length.toString(), inline: true },
        { name: 'Words', value: wordCount.toString(), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LengthCommand;
