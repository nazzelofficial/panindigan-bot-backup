import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DocumentCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'document',
      description: 'Generate documentation for code using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['docs', 'jsdoc'],
      examples: ['/document function myFunc() { return x; }', 'p!document paste code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to document').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('language').setDescription('Programming language').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    const lang = interaction.options.getString('language') || 'auto-detect';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        `You are a documentation expert. Generate comprehensive documentation for the following ${lang} code. Include: JSDoc/docstrings, parameter descriptions, return value, usage examples, and any important notes. Format it properly.`
      );
      const content = response.content.slice(0, 3800);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📚 Documentation Generated`)
        .setColor(COLORS.info)
        .addFields(
          { name: '💻 Code', value: `\`\`\`${lang === 'auto-detect' ? '' : lang}\n${code.slice(0, 800)}\n\`\`\``, inline: false },
          { name: '📖 Documentation', value: content || 'No response.', inline: false }
        )
        .setFooter({ text: `Language: ${lang} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to document.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating documentation...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Generate comprehensive documentation for this code: JSDoc/docstrings, parameter descriptions, return value, and usage examples.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📚 Documentation Generated`)
        .setColor(COLORS.info)
        .addFields({ name: '📖 Documentation', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default DocumentCommand;
