import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ProofreadCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'proofread',
      description: 'Proofread and correct text using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['correct', 'fixgrammar'],
      examples: ['/proofread this text', 'p!proofread check my writing'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text') || '';
    if (!text) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide text to proofread.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✅ AI Proofreader`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Corrected', value: 'This is a placeholder. AI proofreading will be implemented with the AIHandler.', inline: false },
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
        .setDescription('Please provide text to proofread.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} ✅ AI Proofreader`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original', value: text.substring(0, 500) + (text.length > 500 ? '...' : ''), inline: false },
        { name: 'Corrected', value: 'This is a placeholder. AI proofreading will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ProofreadCommand;
