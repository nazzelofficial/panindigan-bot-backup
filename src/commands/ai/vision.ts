// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class VisionCommand extends BaseCommand {
  constructor() {
    super({
      name: 'vision',
      description: 'Analyze an attached image using AI vision (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 15,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['imageanalyze', 'visionai'],
      examples: ['/vision (attach an image)', 'p!vision (attach an image to message)'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addAttachmentOption(o =>
        o.setName('image').setDescription('Image to analyze').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('prompt').setDescription('Optional question about the image').setRequired(false).setMaxLength(500)
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const attachment = i.options.getAttachment('image', true);
    const userPrompt = i.options.getString('prompt') || 'Describe this image in detail.';

    if (!attachment.contentType?.startsWith('image/')) {
      await i.reply({ content: `${EMOJIS.error} Please attach a valid image file (PNG, JPG, GIF, WEBP).`, ephemeral: true });
      return;
    }

    await i.deferReply();
    try {
      const client = i.client as PanindiganClient;
      const prompt = `[Image URL: ${attachment.url}]\n\nUser request: ${userPrompt}\n\nPlease analyze the provided image and respond to the user's request thoroughly. Describe what you see, including objects, people, colors, text, setting, and any notable details.`;

      const response = await client.aiHandler.generateTaskResponse(attachment.url, prompt);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 👁️ Vision Analysis`)
        .setColor(COLORS.gold)
        .setImage(attachment.url)
        .addFields(
          { name: '❓ Question', value: userPrompt, inline: false },
          { name: '🤖 AI Analysis', value: response.content.slice(0, 3800) || 'No analysis returned.', inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
        .setTimestamp();

      await i.editReply({ embeds: [embed] });
    } catch (err: any) {
      await i.editReply({ content: `${EMOJIS.error} Error analyzing image: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const attachment = m.attachments.first();
    if (!attachment) {
      return void m.reply(`${EMOJIS.error} Please attach an image to analyze.`);
    }
    if (!attachment.contentType?.startsWith('image/')) {
      return void m.reply(`${EMOJIS.error} Please attach a valid image file (PNG, JPG, GIF, WEBP).`);
    }

    const userPrompt = _args.join(' ') || 'Describe this image in detail.';
    const thinking = await m.reply(`${EMOJIS.ai} Analyzing image...`);
    try {
      const client = m.client as PanindiganClient;
      const prompt = `[Image URL: ${attachment.url}]\n\nUser request: ${userPrompt}\n\nAnalyze the provided image and respond to the user's request. Describe objects, people, colors, text, setting, and notable details.`;

      const response = await client.aiHandler.generateTaskResponse(attachment.url, prompt);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 👁️ Vision Analysis`)
        .setColor(COLORS.gold)
        .setImage(attachment.url)
        .addFields(
          { name: '❓ Question', value: userPrompt, inline: false },
          { name: '🤖 AI Analysis', value: response.content.slice(0, 3800), inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();

      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default VisionCommand;
