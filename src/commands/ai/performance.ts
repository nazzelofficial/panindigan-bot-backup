// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PerformanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'performance',
      description: 'Analyze code performance and get improvement tips using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['perfcheck', 'profiling'],
      examples: ['/performance code to analyze', 'p!performance paste code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to analyze').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'You are a performance analysis expert. Analyze the code for performance: 1) Time complexity (Big-O notation). 2) Space complexity. 3) Specific bottlenecks (N+1 queries, redundant loops, excessive memory, etc.). 4) Concrete optimization recommendations with code examples. Be specific and quantitative.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📊 Performance Analysis`)
        .setColor(COLORS.warning)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false },
          { name: '📈 Analysis', value: response.content.slice(0, 3400), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const code = _args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to analyze.`);
    const thinking = await message.reply(`${EMOJIS.ai} Analyzing performance...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Analyze performance: time complexity, space complexity, bottlenecks, and concrete optimization recommendations.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📊 Performance Analysis`)
        .setColor(COLORS.warning)
        .addFields({ name: '📈 Analysis', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default PerformanceCommand;
