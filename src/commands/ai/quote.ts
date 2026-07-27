// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class QuoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'quote',
      description: 'Generate an inspirational or creative quote using AI',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['inspire', 'motivation'],
      examples: ['/quote about perseverance', 'p!quote about coding life'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('topic').setDescription('Quote topic or theme').setRequired(false))
      .addStringOption(o => o.setName('type').setDescription('Quote type').setRequired(false)
        .addChoices(
          { name: 'Real historical quote', value: 'historical' },
          { name: 'AI-generated original', value: 'original' },
          { name: 'Funny', value: 'funny' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'life and wisdom';
    const type = interaction.options.getString('type') || 'original';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const systemPrompt = type === 'historical'
        ? `Share a real, inspiring quote about ${topic} from a historical figure, philosopher, or notable person. Include who said it and brief context.`
        : type === 'funny'
        ? `Create a clever, funny original quote about ${topic}. Make it witty and memorable.`
        : `Create an original, profound, and inspiring quote about ${topic}. Make it poetic, thought-provoking, and memorable. Then attribute it with "[Your Name]" or a fitting persona.`;
      const response = await client.aiHandler.generateTaskResponse(topic, systemPrompt);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💬 Quote`)
        .setColor(0x8b5cf6)
        .setDescription(`*${response.content.slice(0, 2000)}*`)
        .setFooter({ text: `Topic: ${topic} | Type: ${type} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const topic = _args.join(' ') || 'life and wisdom';
    const thinking = await message.reply(`${EMOJIS.ai} Finding a quote...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        topic,
        `Create or share an inspiring, memorable quote about ${topic}. Make it profound and thought-provoking.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💬 Quote`)
        .setColor(0x8b5cf6)
        .setDescription(`*${response.content.slice(0, 2000)}*`)
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default QuoteCommand;
