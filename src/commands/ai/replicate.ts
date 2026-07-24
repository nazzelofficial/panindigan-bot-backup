import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ReplicateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'replicate',
      description: 'Generate creative content using AI (Replicate-style open models)',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/replicate Generate a fantasy story', 'p!replicate Create a haiku'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Your creative prompt').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        'You are a creative AI model. Generate imaginative, engaging, and high-quality creative content based on the prompt. Be original and expressive.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🎨 AI Creative Generation`)
        .setColor(0x6366f1)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '✨ Output', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const prompt = args.join(' ');
    if (!prompt) return void message.reply(`${EMOJIS.error} Please provide a prompt.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        'You are a creative AI model. Generate imaginative, engaging, and high-quality creative content based on the prompt.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🎨 AI Creative Generation`)
        .setColor(0x6366f1)
        .addFields(
          { name: '💬 Prompt', value: prompt.slice(0, 1024), inline: false },
          { name: '✨ Output', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ReplicateCommand;
