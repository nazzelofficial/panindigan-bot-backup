// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class AnalyzeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'analyze',
      description: 'Deep text analysis — key themes, tone, and entities (Silver+)',
      category: 'ai',
      premiumTier: 'silver',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['deepanalyze', 'textanalyze'],
      examples: ['/analyze The economy is experiencing significant growth', 'p!analyze The speech was full of ambiguity'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('text').setDescription('Text to analyze deeply').setRequired(true).setMaxLength(2000)
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const text = i.options.getString('text', true);
    await i.deferReply();
    try {
      const client = i.client as PanindiganClient;
      const prompt = `Perform a deep text analysis on the following text. Provide:
1. **Key Themes** – main ideas and subjects discussed.
2. **Tone & Mood** – overall emotional register (formal, casual, aggressive, neutral, etc.).
3. **Named Entities** – people, places, organizations, dates mentioned.
4. **Sentiment** – positive, negative, or neutral with explanation.
5. **Writing Style** – concise description of the author's style.
6. **Summary** – 1-2 sentence summary.

Text: "${text}"`;
      const response = await client.aiHandler.generateTaskResponse(text, prompt);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔍 Deep Text Analysis`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Input Text', value: text.length > 512 ? text.slice(0, 509) + '...' : text, inline: false },
          { name: '📊 Analysis', value: response.content.slice(0, 3800) || 'No analysis returned.', inline: false },
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
    if (!text) return void m.reply(`${EMOJIS.error} Please provide text to analyze.`);
    const thinking = await m.reply(`${EMOJIS.ai} Analyzing text deeply...`);
    try {
      const client = m.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'Perform a deep text analysis: key themes, tone & mood, named entities, sentiment, writing style, and a brief summary.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔍 Deep Text Analysis`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Input', value: text.slice(0, 512), inline: false },
          { name: '📊 Analysis', value: response.content.slice(0, 3800), inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default AnalyzeCommand;
