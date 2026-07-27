// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ImproveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'improve',
      description: 'Improve text quality using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['enhance', 'better'],
      examples: ['/improve My essay here', 'p!improve This paragraph needs help'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to improve').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'You are a writing improvement expert. Enhance the following text to make it clearer, more engaging, and more compelling while preserving the original intent and voice. Provide: 1) The improved version. 2) Brief notes on what was improved.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🚀 Text Improved`)
        .setColor(COLORS.success)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: '✨ Improved', value: response.content.slice(0, 3000), inline: false }
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
    if (!text) return void message.reply(`${EMOJIS.error} Please provide text to improve.`);
    const thinking = await message.reply(`${EMOJIS.ai} Improving...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'Improve this text to be clearer, more engaging, and compelling while keeping the original intent.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🚀 Text Improved`)
        .setColor(COLORS.success)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: '✨ Improved', value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ImproveCommand;
