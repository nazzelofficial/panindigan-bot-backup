import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ResumeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'resume',
      description: 'Generate a resume using AI',
      category: 'ai',
      cooldown: 20,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateresume', 'cv'],
      examples: ['/resume software engineer', 'p!resume marketing manager'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const jobTitle = interaction.options.getString('jobtitle') || '';
    const experience = interaction.options.getString('experience') || 'entry level';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for resume generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📄 AI Resume Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Experience Level', value: experience, inline: true },
        { name: 'Resume', value: 'This is a placeholder. AI resume generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const jobTitle = args[0] || '';
    const experience = args[1] || 'entry level';

    if (!jobTitle) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a job title for resume generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📄 AI Resume Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Job Title', value: jobTitle, inline: true },
        { name: 'Experience Level', value: experience, inline: true },
        { name: 'Resume', value: 'This is a placeholder. AI resume generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ResumeCommand;
