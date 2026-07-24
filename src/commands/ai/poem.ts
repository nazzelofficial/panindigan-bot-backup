import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PoemCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poem',
      description: 'Generate a poem using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['poetry', 'verse'],
      examples: ['/poem The ocean at night', 'p!poem Longing for home'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('topic').setDescription('Topic or theme for the poem').setRequired(true))
      .addStringOption(o => o.setName('style').setDescription('Poem style').setRequired(false)
        .addChoices(
          { name: 'Free verse', value: 'free verse' },
          { name: 'Haiku', value: 'haiku' },
          { name: 'Sonnet', value: 'sonnet' },
          { name: 'Limerick', value: 'limerick' },
          { name: 'Ode', value: 'ode' },
          { name: 'Acrostic', value: 'acrostic' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic', true);
    const style = interaction.options.getString('style') || 'free verse';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        topic,
        `You are a skilled poet. Write a beautiful, evocative ${style} poem about the given topic. Use vivid imagery, strong metaphors, and appropriate rhythm. Make it emotionally resonant and original.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌸 Poem`)
        .setColor(0xf9a8d4)
        .addFields({ name: `📜 ${topic} (${style})`, value: response.content.slice(0, 4000), inline: false })
        .setFooter({ text: `Style: ${style} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const topic = args.join(' ');
    if (!topic) return void message.reply(`${EMOJIS.error} Please provide a poem topic.`);
    const thinking = await message.reply(`${EMOJIS.ai} Writing a poem...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        topic,
        'Write a beautiful, evocative free verse poem with vivid imagery, strong metaphors, and emotional resonance.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🌸 Poem: ${topic.slice(0, 50)}`)
        .setColor(0xf9a8d4)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default PoemCommand;
