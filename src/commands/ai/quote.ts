import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class QuoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'quote',
      description: 'Generate a quote using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatequote', 'wisdom'],
      examples: ['/quote about success', 'p!quote about life'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'life';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💬 AI Quote Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Quote', value: 'This is a placeholder. AI quote generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const topic = args.join(' ') || 'life';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💬 AI Quote Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Quote', value: 'This is a placeholder. AI quote generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default QuoteCommand;
