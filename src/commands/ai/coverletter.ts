import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CoverLetterCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'coverletter',
      description: 'Generate a professional cover letter using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cover', 'application'],
      examples: ['/coverletter Software Engineer at Google, 3 years experience', 'p!coverletter Marketing Manager, fresh grad'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('job').setDescription('Job position and company').setRequired(true))
      .addStringOption(o => o.setName('experience').setDescription('Your relevant experience and skills').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const job = interaction.options.getString('job', true);
    const experience = interaction.options.getString('experience') || '';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const input = experience ? `Job: ${job}\nExperience: ${experience}` : `Job: ${job}`;
      const response = await client.aiHandler.generateTaskResponse(
        input,
        'You are a professional career coach and HR expert. Write a compelling, personalized cover letter. Include: professional greeting, strong opening hook, relevant experience and achievements (use metrics when possible), why you want this role, what you bring to the company, strong closing call-to-action. Keep it concise (3-4 paragraphs) and impactful.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📄 Cover Letter`)
        .setColor(COLORS.info)
        .addFields({ name: `📋 For: ${job.slice(0, 60)}`, value: response.content.slice(0, 4000), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const job = args.join(' ');
    if (!job) return void message.reply(`${EMOJIS.error} Please provide the job position.`);
    const thinking = await message.reply(`${EMOJIS.ai} Writing cover letter...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Job: ${job}`,
        'Write a compelling cover letter: professional greeting, strong opening, relevant experience, why you want the role, and strong closing. 3-4 paragraphs.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📄 Cover Letter`)
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

export default CoverLetterCommand;
