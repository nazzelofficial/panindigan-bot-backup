// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class IdeaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'idea',
      description: 'Brainstorm ideas using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['brainstorm', 'ideas'],
      examples: ['/idea Discord bot features', 'p!idea Side projects to learn coding'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('topic').setDescription('Topic to brainstorm ideas for').setRequired(true))
      .addNumberOption(o => o.setName('count').setDescription('Number of ideas (default: 5)').setMinValue(3).setMaxValue(10).setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic', true);
    const count = interaction.options.getNumber('count') || 5;
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        topic,
        `You are a creative brainstorming expert. Generate ${count} unique, actionable, and creative ideas for the given topic. Number each idea. For each: brief title, 1-2 sentence description, and one key benefit. Make them diverse in approach.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💡 Ideas: ${topic.slice(0, 50)}`)
        .setColor(COLORS.warning)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `${count} ideas | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const topic = _args.join(' ');
    if (!topic) return void message.reply(`${EMOJIS.error} Please provide a topic for brainstorming.`);
    const thinking = await message.reply(`${EMOJIS.ai} Brainstorming ideas...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        topic,
        'Generate 5 unique, actionable, and creative ideas for the topic. Number each with a title, description, and key benefit.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💡 Ideas: ${topic.slice(0, 50)}`)
        .setColor(COLORS.warning)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default IdeaCommand;
