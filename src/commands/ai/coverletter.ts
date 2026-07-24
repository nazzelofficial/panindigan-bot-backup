import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CoverLetterCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'coverletter',
      description: 'Generate a cover letter using AI',
      category: 'ai',
      cooldown: 20,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatecoverletter', 'cl'],
      examples: ['/coverletter software engineer', 'p!coverletter marketing'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const jobTitle = interaction.options.getString('jobtitle') || '';
    const company = interaction.options.getString('company') || '';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for cover letter generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📝 AI Cover Letter Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Company', value: company || 'Not specified', inline: true },
        { name: 'Cover Letter', value: 'This is a placeholder. AI cover letter generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const jobTitle = args[0] || '';
    const company = args[1] || '';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for cover letter generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📝 AI Cover Letter Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Company', value: company || 'Not specified', inline: true },
        { name: 'Cover Letter', value: 'This is a placeholder. AI cover letter generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CoverLetterCommand;
