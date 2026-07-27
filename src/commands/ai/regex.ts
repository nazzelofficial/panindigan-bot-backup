// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class RegexCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'regex',
      description: 'Generate or explain regex patterns using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['regexp', 'pattern'],
      examples: ['/regex Match email addresses', 'p!regex Validate Philippine phone numbers'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('description').setDescription('What the regex should match').setRequired(true))
      .addStringOption(o => o.setName('mode').setDescription('Generate or explain').setRequired(false)
        .addChoices(
          { name: 'Generate regex', value: 'generate' },
          { name: 'Explain this regex', value: 'explain' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const description = interaction.options.getString('description', true);
    const mode = interaction.options.getString('mode') || 'generate';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const systemPrompt = mode === 'explain'
        ? 'You are a regex expert. Explain the following regex pattern in detail: what each part matches, use cases, and limitations. Provide test examples.'
        : 'You are a regex expert. Generate a regex pattern for the following requirement. Provide: 1) The regex pattern. 2) Explanation of each part. 3) Test examples that should match and not match. 4) JavaScript usage example. Make it accurate and efficient.';
      const response = await client.aiHandler.generateTaskResponse(description, systemPrompt);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔤 Regex ${mode === 'explain' ? 'Explained' : 'Generated'}`)
        .setColor(COLORS.info)
        .addFields(
          { name: mode === 'explain' ? '🔍 Pattern' : '📋 Requirement', value: description.slice(0, 512), inline: false },
          { name: '📝 Result', value: response.content.slice(0, 3500), inline: false }
        )
        .setFooter({ text: `Mode: ${mode} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const description = _args.join(' ');
    if (!description) return void message.reply(`${EMOJIS.error} Please describe the pattern you need.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating regex...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        description,
        'Generate a regex pattern: the pattern itself, explanation of each part, test examples, and JavaScript usage.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔤 Regex Generated`)
        .setColor(COLORS.info)
        .addFields({ name: '📝 Result', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default RegexCommand;
