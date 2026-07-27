// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PerplexityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'perplexity',
      description: 'Search and answer questions with AI (Perplexity-style)',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pplx', 'search'],
      examples: ['/perplexity What is the latest news on AI?', 'p!perplexity How does blockchain work?'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('Your search query or question').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        query,
        'You are a research AI assistant similar to Perplexity AI. Answer questions with accurate, well-sourced information. Be comprehensive yet concise. For factual questions, provide structured answers with key points. Acknowledge when information may be outdated.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔍 AI Search`)
        .setColor(0x20b2aa)
        .addFields(
          { name: '🔍 Query', value: query.slice(0, 1024), inline: false },
          { name: '📋 Answer', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `AI-powered search | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const query = _args.join(' ');
    if (!query) return void message.reply(`${EMOJIS.error} Please provide a search query.`);
    const thinking = await message.reply(`${EMOJIS.ai} Searching...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        query,
        'You are a research AI assistant similar to Perplexity AI. Answer questions with accurate, well-sourced information. Be comprehensive yet concise.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔍 AI Search`)
        .setColor(0x20b2aa)
        .addFields(
          { name: '🔍 Query', value: query.slice(0, 1024), inline: false },
          { name: '📋 Answer', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `AI-powered search | Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default PerplexityCommand;
