// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class InterviewCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'interview',
      description: 'Generate interview questions and answers using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['questions', 'prep'],
      examples: ['/interview Software Engineer at startup', 'p!interview Data Scientist Python'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('role').setDescription('Job role/position to prepare for').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('Interview type').setRequired(false)
        .addChoices(
          { name: 'Behavioral (STAR)', value: 'behavioral' },
          { name: 'Technical', value: 'technical' },
          { name: 'Mixed', value: 'mixed' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getString('role', true);
    const type = interaction.options.getString('type') || 'mixed';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        role,
        `You are an interview coach. Generate 5 ${type} interview questions for a ${role} position. For each question: the question itself, what the interviewer is looking for, and a sample strong answer using the STAR method where applicable. Make them realistic and challenging.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🎤 Interview Prep: ${role.slice(0, 50)}`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Type: ${type} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const role = _args.join(' ');
    if (!role) return void message.reply(`${EMOJIS.error} Please provide a job role.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating interview questions...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        role,
        'Generate 5 interview questions with what the interviewer looks for and sample strong answers using STAR method.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🎤 Interview Prep`)
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

export default InterviewCommand;
