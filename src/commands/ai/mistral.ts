import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MistralCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mistral',
      description: 'Chat with Mistral AI (via OpenAI-compatible API)',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/mistral your prompt here', 'p!mistral ask something'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Your prompt for Mistral').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      // Mistral routes through the primary provider with a Mistral-specific system hint
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        'You are Mistral AI, a helpful and multilingual AI assistant created by Mistral AI. Respond helpfully and concisely.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌊 Mistral AI`)
        .setColor(0xff7000)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Mistral AI | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const prompt = args.join(' ');
    if (!prompt) return void message.reply(`${EMOJIS.error} Please provide a prompt.`);
    const thinking = await message.reply(`${EMOJIS.ai} Asking Mistral...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        'You are Mistral AI, a helpful and multilingual AI assistant created by Mistral AI. Respond helpfully and concisely.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌊 Mistral AI`)
        .setColor(0xff7000)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '🤖 Response', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Mistral AI | Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default MistralCommand;
