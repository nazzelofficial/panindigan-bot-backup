// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SummarizeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'summarize',
      description: 'Summarize text using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['summary', 'tldr'],
      examples: ['/summarize <long text>', 'p!summarize paste text here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to summarize').setRequired(true).setMaxLength(3000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'You are a summarization expert. Provide a concise, accurate summary of the given text. Use bullet points for key points. Keep it under 300 words. Start with a 1-sentence TL;DR, then list the main points.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📝 Summary`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📄 Original', value: text.slice(0, 512) + (text.length > 512 ? '...' : ''), inline: false },
          { name: '📋 Summary', value: response.content.slice(0, 4000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const text = _args.join(' ');
    if (!text) return void message.reply(`${EMOJIS.error} Please provide text to summarize.`);
    const thinking = await message.reply(`${EMOJIS.ai} Summarizing...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'You are a summarization expert. Provide a concise, accurate summary with bullet points. Start with a 1-sentence TL;DR, then list the main points.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📝 Summary`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📄 Original', value: text.slice(0, 512) + (text.length > 512 ? '...' : ''), inline: false },
          { name: '📋 Summary', value: response.content.slice(0, 4000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default SummarizeCommand;
