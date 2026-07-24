import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CodeExplainCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'codeexplain',
      description: 'Explain what code does using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['whatiscode', 'howdoes'],
      examples: ['/codeexplain const x = arr.reduce((a, b) => a + b, 0)', 'p!codeexplain paste code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to explain').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'You are an expert programmer and teacher. Explain what the following code does step by step. Include: 1) A one-sentence summary. 2) Line-by-line or block-by-block explanation. 3) What it returns/outputs. 4) Any potential issues or edge cases. Make it clear for someone learning.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔬 Code Explanation`)
        .setColor(COLORS.info)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 800)}\n\`\`\``, inline: false },
          { name: '📖 Explanation', value: response.content.slice(0, 3200), inline: false }
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
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to explain.`);
    const thinking = await message.reply(`${EMOJIS.ai} Explaining code...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Explain what this code does step by step, including summary, line-by-line explanation, output, and potential issues.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔬 Code Explanation`)
        .setColor(COLORS.info)
        .addFields({ name: '📖 Explanation', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default CodeExplainCommand;
