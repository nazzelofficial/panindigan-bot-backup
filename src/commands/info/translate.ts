import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TranslateInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'translate',
      description: 'Translate text to another language',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['trans'],
      examples: ['/translate Hello | Filipino', 'p!translate Kumain ka na | English'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('language').setDescription('Target language').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const language = interaction.options.getString('language', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        `Translate the following text to ${language}. Provide only the translation, nothing else.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🌐 Translation → ${language}`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: `🌍 ${language}`, value: response.content.slice(0, 2000), inline: false }
        )
        .setFooter({ text: `AI-powered translation` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Translation failed: ${err.message}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const input = args.join(' ');
    const parts = input.split('|');
    const text = parts[0]?.trim();
    const language = parts[1]?.trim() || 'English';
    if (!text) return void message.reply(`${EMOJIS.error} Usage: \`p!translate <text> | <language>\``);
    const thinking = await message.reply(`${EMOJIS.info} Translating...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        `Translate to ${language}. Provide only the translation.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🌐 Translation → ${language}`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: `🌍 ${language}`, value: response.content.slice(0, 2000), inline: false }
        )
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Translation failed: ${err.message}`);
    }
  }
}

export default TranslateInfoCommand;
