import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SentimentCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sentiment',
      description: 'Analyze the sentiment of text using AI',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['emotion', 'mood'],
      examples: ['/sentiment I love this bot!', 'p!sentiment Today was terrible'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to analyze').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'You are a sentiment analysis expert. Analyze the sentiment of the following text. Provide: 1) Overall sentiment (Positive/Negative/Neutral/Mixed) with a confidence score (0-100%). 2) Emotions detected (e.g., joy, anger, sadness, fear, surprise). 3) Key phrases driving the sentiment. 4) A brief explanation. Format clearly.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📊 Sentiment Analysis`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Text', value: text.slice(0, 1024), inline: false },
          { name: '📈 Analysis', value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const text = args.join(' ');
    if (!text) return void message.reply(`${EMOJIS.error} Please provide text to analyze.`);
    const thinking = await message.reply(`${EMOJIS.ai} Analyzing sentiment...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'Analyze the sentiment: overall sentiment, emotions detected, key phrases, and brief explanation.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📊 Sentiment Analysis`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Text', value: text.slice(0, 1024), inline: false },
          { name: '📈 Analysis', value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default SentimentCommand;
