// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class GenerateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'generate',
      description: 'Generate creative content using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gen', 'create'],
      examples: ['/generate A discord server description for a gaming community', 'p!generate Username ideas for a tech streamer'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('request').setDescription('What to generate').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const request = interaction.options.getString('request', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        request,
        'You are a creative content generator. Generate high-quality, original content based on the request. Be creative, specific, and immediately useful. Format the output clearly.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ✨ Generated Content`)
        .setColor(COLORS.primary)
        .addFields(
          { name: '📋 Request', value: request.slice(0, 512), inline: false },
          { name: '🎨 Result', value: response.content.slice(0, 3500), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const request = _args.join(' ');
    if (!request) return void message.reply(`${EMOJIS.error} Please provide what to generate.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        request,
        'Generate high-quality, original content. Be creative, specific, and immediately useful.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ✨ Generated Content`)
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

export default GenerateCommand;
