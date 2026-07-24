import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RewriteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rewrite',
      description: 'Rewrite text in a different tone or style using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['redo', 'revise'],
      examples: ['/rewrite I need help | professional', 'p!rewrite My report | simple'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to rewrite').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('tone').setDescription('Target tone/style').setRequired(false)
        .addChoices(
          { name: 'Professional', value: 'professional' },
          { name: 'Casual', value: 'casual' },
          { name: 'Formal', value: 'formal' },
          { name: 'Persuasive', value: 'persuasive' },
          { name: 'Simple', value: 'simple' },
          { name: 'Creative', value: 'creative' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const tone = interaction.options.getString('tone') || 'professional';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        `You are a professional writer. Rewrite the following text in a ${tone} tone and style. Keep the same core message but change the delivery to match the desired tone perfectly. Provide only the rewritten version.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ✍️ Rewrite (${tone})`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: `✨ Rewritten (${tone})`, value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const input = args.join(' ');
    const parts = input.split('|');
    const text = parts[0]?.trim();
    const tone = parts[1]?.trim() || 'professional';
    if (!text) return void message.reply(`${EMOJIS.error} Usage: \`p!rewrite <text> | <tone>\``);
    const thinking = await message.reply(`${EMOJIS.ai} Rewriting...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        `Rewrite this text in a ${tone} tone while keeping the same core message.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ✍️ Rewrite`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: '✨ Rewritten', value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Tone: ${tone} | Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default RewriteCommand;
