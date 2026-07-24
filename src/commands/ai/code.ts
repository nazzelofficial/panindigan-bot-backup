import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'code',
      description: 'Generate code using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['codegen', 'generate-code'],
      examples: ['/code A function to sort an array | JavaScript', 'p!code REST API endpoint | Python'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('task').setDescription('What code to generate').setRequired(true))
      .addStringOption(o => o.setName('language').setDescription('Programming language (default: JavaScript)').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const task = interaction.options.getString('task', true);
    const language = interaction.options.getString('language') || 'JavaScript';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        task,
        `You are an expert ${language} developer. Write clean, well-commented, production-ready ${language} code for the given task. Include: the code itself (in a code block), brief explanation, and usage example. Follow best practices and modern conventions.`
      );
      const content = response.content;
      // Try to fit in embed; if too long, truncate
      const display = content.length > 3800 ? content.slice(0, 3800) + '\n...(truncated)' : content;
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💻 Code Generated (${language})`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📋 Task', value: task.slice(0, 512), inline: false },
          { name: '📝 Code', value: display, inline: false }
        )
        .setFooter({ text: `Language: ${language} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const input = args.join(' ');
    const parts = input.split('|');
    const task = parts[0]?.trim();
    const language = parts[1]?.trim() || 'JavaScript';
    if (!task) return void message.reply(`${EMOJIS.error} Usage: \`p!code <task> | <language>\``);
    const thinking = await message.reply(`${EMOJIS.ai} Generating code...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        task,
        `Write clean, well-commented ${language} code for this task. Include the code, brief explanation, and usage example.`
      );
      const display = response.content.length > 3800 ? response.content.slice(0, 3800) + '\n...(truncated)' : response.content;
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💻 Code Generated (${language})`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📋 Task', value: task.slice(0, 512), inline: false },
          { name: '📝 Code', value: display, inline: false }
        )
        .setFooter({ text: `Language: ${language} | Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default CodeCommand;
