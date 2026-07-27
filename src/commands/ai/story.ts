// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class StoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'story',
      description: 'Generate a creative short story using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shortstory', 'fiction'],
      examples: ['/story A dragon who is afraid of fire', 'p!story Lost in space with no way home'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('Story idea or theme').setRequired(true))
      .addStringOption(o => o.setName('genre').setDescription('Story genre').setRequired(false)
        .addChoices(
          { name: 'Fantasy', value: 'fantasy' },
          { name: 'Sci-Fi', value: 'sci-fi' },
          { name: 'Horror', value: 'horror' },
          { name: 'Romance', value: 'romance' },
          { name: 'Adventure', value: 'adventure' },
          { name: 'Mystery', value: 'mystery' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    const genre = interaction.options.getString('genre') || 'adventure';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        `You are a creative fiction writer. Write an engaging ${genre} short story based on the prompt. Include compelling characters, vivid descriptions, conflict, and a satisfying resolution. Keep it under 800 words but make every word count.`
      );
      const content = response.content.slice(0, 4000);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📖 Short Story`)
        .setColor(COLORS.primary)
        .setDescription(content)
        .setFooter({ text: `Genre: ${genre} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const prompt = _args.join(' ');
    if (!prompt) return void message.reply(`${EMOJIS.error} Please provide a story prompt.`);
    const thinking = await message.reply(`${EMOJIS.ai} Writing your story...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        prompt,
        'Write an engaging short story with compelling characters, vivid descriptions, conflict, and a satisfying resolution. Under 800 words.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📖 Short Story`)
        .setColor(COLORS.primary)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default StoryCommand;
