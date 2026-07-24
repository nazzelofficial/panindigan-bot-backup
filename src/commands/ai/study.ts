import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class StudyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'study',
      description: 'Generate a study plan using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatestudy', 'learn'],
      examples: ['/study mathematics', 'p!study history'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const subject = interaction.options.getString('subject') || '';
    if (!subject) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a subject for study plan generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Study Plan Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Subject', value: subject, inline: false },
        { name: 'Study Plan', value: 'This is a placeholder. AI study plan generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const subject = args.join(' ');

    if (!subject) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a subject for study plan generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Study Plan Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Subject', value: subject, inline: false },
        { name: 'Study Plan', value: 'This is a placeholder. AI study plan generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default StudyCommand;
