import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InterviewCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'interview',
      description: 'Generate interview questions using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateinterview', 'questions'],
      examples: ['/interview software engineer', 'p!interview marketing'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const jobTitle = interaction.options.getString('jobtitle') || '';
    const difficulty = interaction.options.getString('difficulty') || 'medium';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for interview question generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🎤 AI Interview Question Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Difficulty', value: difficulty, inline: true },
        { name: 'Interview Questions', value: 'This is a placeholder. AI interview question generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const jobTitle = args[0] || '';
    const difficulty = args[1] || 'medium';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for interview question generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🎤 AI Interview Question Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Difficulty', value: difficulty, inline: true },
        { name: 'Interview Questions', value: 'This is a placeholder. AI interview question generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default InterviewCommand;
