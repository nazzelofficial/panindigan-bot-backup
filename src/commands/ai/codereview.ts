import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CodeReviewCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'codereview',
      description: 'Get an AI code review with feedback and suggestions',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['review-code', 'cr'],
      examples: ['/codereview function add(a, b) { return a + b }', 'p!codereview paste code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to review').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'You are a senior software engineer doing a code review. Review the code and provide: 1) Overall assessment (rating 1-10). 2) Bugs or logical errors found. 3) Performance issues. 4) Security concerns. 5) Code style/readability. 6) Specific improvement suggestions with examples. Be constructive and thorough.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 👁️ Code Review`)
        .setColor(COLORS.warning)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false },
          { name: '📋 Review', value: response.content.slice(0, 3400), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to review.`);
    const thinking = await message.reply(`${EMOJIS.ai} Reviewing code...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Do a code review: assessment, bugs, performance issues, security concerns, style, and improvement suggestions.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 👁️ Code Review`)
        .setColor(COLORS.warning)
        .addFields({ name: '📋 Review', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default CodeReviewCommand;
