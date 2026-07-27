// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ResumeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'resume',
      description: 'Get AI help with your resume - review, improve, or generate sections',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cv'],
      examples: ['/resume review my summary: I am a developer with 5 years experience', 'p!resume generate experience for Software Engineer'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('content').setDescription('Resume section to review/improve, or job title to generate for').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('action').setDescription('What to do').setRequired(false)
        .addChoices(
          { name: 'Review and improve', value: 'review' },
          { name: 'Generate bullet points', value: 'generate' },
          { name: 'Write summary/objective', value: 'summary' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const content = interaction.options.getString('content', true);
    const action = interaction.options.getString('action') || 'review';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const systemPrompts: Record<string, string> = {
        review: 'You are a professional resume writer and career coach. Review and improve the resume section. Use action verbs, quantify achievements, remove weak language. Provide the improved version and explain key changes.',
        generate: 'You are a professional resume writer. Generate 4-6 strong, quantified bullet points for this role. Use powerful action verbs and include metrics (increased X by Y%, managed Z team, etc.).',
        summary: 'You are a professional resume writer. Write a compelling 2-3 sentence professional summary. Be specific, achievement-focused, and tailored. Avoid clichés.'
      };
      const response = await client.aiHandler.generateTaskResponse(content, systemPrompts[action] || systemPrompts.review);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📄 Resume Assistant`)
        .setColor(COLORS.info)
        .addFields(
          { name: `✨ ${action.charAt(0).toUpperCase() + action.slice(1)}`, value: response.content.slice(0, 4000), inline: false }
        )
        .setFooter({ text: `Action: ${action} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const content = _args.join(' ');
    if (!content) return void message.reply(`${EMOJIS.error} Please provide your resume content.`);
    const thinking = await message.reply(`${EMOJIS.ai} Working on resume...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        content,
        'Review and improve this resume section. Use action verbs, quantify achievements, remove weak language. Provide improved version and explain changes.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📄 Resume Improved`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ResumeCommand;
