// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class GroqCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'groq',
      description: 'Chat with Groq AI (ultra-fast Llama inference)',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['llama', 'fast'],
      examples: ['/groq Explain recursion', 'p!groq Write JavaScript code'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Your prompt for Groq').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateWithProvider(
        interaction.user.id, interaction.guildId || 'dm', prompt, 'groq'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ⚡ Groq AI`)
        .setColor(0xf55036)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Model: ${response.model} | Groq (Ultra-Fast)${response.tokens ? ` • ${response.tokens} tokens` : ''}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Groq unavailable: ${err.message || 'Please check API key.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const prompt = _args.join(' ');
    if (!prompt) return void message.reply(`${EMOJIS.error} Please provide a prompt.`);
    const thinking = await message.reply(`${EMOJIS.ai} Asking Groq...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateWithProvider(
        message.author.id, message.guildId || 'dm', prompt, 'groq'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ⚡ Groq AI`)
        .setColor(0xf55036)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Model: ${response.model} | Groq` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Groq unavailable: ${err.message || 'Please check API key.'}`);
    }
  }
}

export default GroqCommand;
