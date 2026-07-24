import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ClaudeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'claude',
      description: 'Chat with Anthropic Claude AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['anthropic'],
      examples: ['/claude Analyze this text', 'p!claude Write a detailed essay'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Your prompt for Claude').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateWithProvider(
        interaction.user.id, interaction.guildId || 'dm', prompt, 'anthropic'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧠 Claude AI`)
        .setColor(0xd97706)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Model: ${response.model} | Anthropic` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Claude unavailable: ${err.message || 'Please check API key.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const prompt = args.join(' ');
    if (!prompt) return void message.reply(`${EMOJIS.error} Please provide a prompt.`);
    const thinking = await message.reply(`${EMOJIS.ai} Asking Claude...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateWithProvider(
        message.author.id, message.guildId || 'dm', prompt, 'anthropic'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧠 Claude AI`)
        .setColor(0xd97706)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Model: ${response.model} | Anthropic` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Claude unavailable: ${err.message || 'Please check API key.'}`);
    }
  }
}

export default ClaudeCommand;
