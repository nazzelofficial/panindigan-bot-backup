// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ClassifyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'classify',
      description: 'Classify text into topics/categories using AI (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['categorize', 'textclassify'],
      examples: ['/classify The stock market fell sharply today', 'p!classify I love hiking in the mountains'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('text').setDescription('Text to classify').setRequired(true).setMaxLength(2000)
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const text = i.options.getString('text', true);
    await i.deferReply();
    try {
      const client = i.client as PanindiganClient;
      const prompt = `Classify the following text into relevant topics and categories. For each category, provide:
1. **Primary Category** – the most fitting broad category (e.g., Technology, Sports, Politics, Entertainment, Science, Health, Finance, Education, etc.)
2. **Subcategories** – 2-4 more specific subtopics
3. **Tags** – 5-8 relevant keyword tags
4. **Confidence** – your confidence percentage for the primary classification
5. **Reasoning** – brief explanation of why you classified it this way

Text: "${text}"`;

      const response = await client.aiHandler.generateTaskResponse(text, prompt);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🏷️ Text Classification`)
        .setColor(COLORS.gold)
        .addFields(
          { name: '📝 Input Text', value: text.length > 512 ? text.slice(0, 509) + '...' : text, inline: false },
          { name: '🏷️ Classification', value: response.content.slice(0, 3800) || 'No classification returned.', inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
        .setTimestamp();

      await i.editReply({ embeds: [embed] });
    } catch (err: any) {
      await i.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const text = _args.join(' ');
    if (!text) return void m.reply(`${EMOJIS.error} Please provide text to classify.`);
    const thinking = await m.reply(`${EMOJIS.ai} Classifying text...`);
    try {
      const client = m.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'Classify the following text into primary category, subcategories, tags, confidence score, and a brief reasoning.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🏷️ Text Classification`)
        .setColor(COLORS.gold)
        .addFields(
          { name: '📝 Input', value: text.slice(0, 512), inline: false },
          { name: '🏷️ Classification', value: response.content.slice(0, 3800), inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ClassifyCommand;
