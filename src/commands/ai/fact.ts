import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FactCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'fact',
      description: 'Get an interesting AI-curated fact',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['trivia', 'didyouknow'],
      examples: ['/fact about space', 'p!fact about the Philippines'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('topic').setDescription('Fact topic (optional)').setRequired(false)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'science, history, nature, or technology';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Topic: ${topic}`,
        `Share 1-2 genuinely surprising, fascinating, and accurate facts about ${topic}. The facts should be verifiable, little-known, and mind-blowing. Start with "🤯 Did you know..." and add why the fact is significant or surprising.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌟 Interesting Fact`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Topic: ${topic} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const topic = args.join(' ') || 'science, history, nature, or technology';
    const thinking = await message.reply(`${EMOJIS.ai} Finding a fact...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Topic: ${topic}`,
        `Share a genuinely surprising, fascinating fact about ${topic}. Start with "🤯 Did you know..." and explain why it's significant.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌟 Interesting Fact`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default FactCommand;
