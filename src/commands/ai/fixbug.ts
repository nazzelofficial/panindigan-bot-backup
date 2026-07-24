import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FixBugCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'fixbug',
      description: 'Find and fix bugs in code using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bugfix', 'fix'],
      examples: ['/fixbug broken code here', 'p!fixbug paste buggy code'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Buggy code to fix').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('error').setDescription('Error message (if any)').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    const error = interaction.options.getString('error') || '';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const input = error ? `Code:\n${code}\n\nError message: ${error}` : code;
      const response = await client.aiHandler.generateTaskResponse(
        input,
        'You are a debugging expert. Find and fix the bug(s) in the code. Provide: 1) What the bug is and why it occurs. 2) The fixed code. 3) Explanation of the fix. If there are multiple bugs, address each one.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🐛 Bug Fixed`)
        .setColor(COLORS.success)
        .addFields(
          { name: '💻 Buggy Code', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false },
          ...(error ? [{ name: '❌ Error', value: error.slice(0, 256), inline: false }] : []),
          { name: '✅ Fix & Explanation', value: response.content.slice(0, 3200), inline: false }
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
    if (!code) return void message.reply(`${EMOJIS.error} Please provide buggy code.`);
    const thinking = await message.reply(`${EMOJIS.ai} Finding and fixing bugs...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Find and fix the bug(s): what the bug is, the fixed code, and explanation of the fix.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🐛 Bug Fixed`)
        .setColor(COLORS.success)
        .addFields({ name: '✅ Fix & Explanation', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default FixBugCommand;
