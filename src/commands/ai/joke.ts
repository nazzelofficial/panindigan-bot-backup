// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class JokeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'joke',
      description: 'Generate a joke using AI',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['funny', 'haha'],
      examples: ['/joke about programmers', 'p!joke about cats'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('topic').setDescription('Joke topic (optional)').setRequired(false))
      .addStringOption(o => o.setName('type').setDescription('Type of joke').setRequired(false)
        .addChoices(
          { name: 'Pun', value: 'pun' },
          { name: 'Knock-knock', value: 'knock-knock' },
          { name: 'One-liner', value: 'one-liner' },
          { name: 'Dad joke', value: 'dad joke' },
          { name: 'Programming', value: 'programming' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'anything';
    const type = interaction.options.getString('type') || 'one-liner';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Topic: ${topic}`,
        `Tell a funny, clean ${type} joke${topic !== 'anything' ? ` about ${topic}` : ''}. Make it clever and actually funny. Keep it family-friendly. If it's a setup/punchline joke, format it clearly.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 😂 Joke`)
        .setColor(COLORS.warning)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Type: ${type} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const topic = _args.join(' ') || 'anything';
    const thinking = await message.reply(`${EMOJIS.ai} Generating joke...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        `Topic: ${topic}`,
        `Tell a funny, clean joke about ${topic}. Make it clever and actually funny. Keep it family-friendly.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 😂 Joke`)
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

export default JokeCommand;
