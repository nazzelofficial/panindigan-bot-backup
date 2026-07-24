import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ExplainCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'explain',
      description: 'Explain a concept using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['explainconcept', 'eli5'],
      examples: ['/explain quantum physics', 'p!explain how photosynthesis works'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const concept = interaction.options.getString('concept') || '';
    if (!concept) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a concept to explain.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Explanation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Concept', value: concept, inline: false },
        { name: 'Explanation', value: 'This is a placeholder. AI explanation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const concept = args.join(' ');

    if (!concept) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a concept to explain.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Explanation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Concept', value: concept, inline: false },
        { name: 'Explanation', value: 'This is a placeholder. AI explanation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ExplainCommand;
