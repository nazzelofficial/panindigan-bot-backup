import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GrammarCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'grammar',
      description: 'Check grammar using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['spellcheck', 'correct'],
      examples: ['/grammar this sentence has bad grammar', 'p!grammar check this text'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to check grammar.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✅ AI Grammar Check`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Corrected', value: 'This is a placeholder. AI grammar checking will be implemented with the AIHandler.', inline: false },
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
        .setDescription('Please provide text to check grammar.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✅ AI Grammar Check`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text, inline: false },
        { name: 'Corrected', value: 'This is a placeholder. AI grammar checking will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GrammarCommand;
