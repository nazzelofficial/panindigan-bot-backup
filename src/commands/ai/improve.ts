import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ImproveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'improve',
      description: 'Improve grammar and style of text using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['enhance', 'betterwriting'],
      examples: ['/improve this text', 'p!improve make this better'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to improve.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✨ AI Text Improver`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Improved', value: 'This is a placeholder. AI text improvement will be implemented with the AIHandler.', inline: false },
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
        .setDescription('Please provide text to improve.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✨ AI Text Improver`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Improved', value: 'This is a placeholder. AI text improvement will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ImproveCommand;
