import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ChatGPTCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'chatgpt',
      description: 'AI command using ChatGPT',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gpt'],
      examples: ['/chatgpt your prompt here', 'p!chatgpt ask something'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt') || '';
    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for ChatGPT.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🤖 ChatGPT`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Response', value: 'This is a placeholder. ChatGPT will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const prompt = args.join(' ');

    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for ChatGPT.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🤖 ChatGPT`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Response', value: 'This is a placeholder. ChatGPT will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ChatGPTCommand;
