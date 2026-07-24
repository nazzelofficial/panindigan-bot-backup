import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'code',
      description: 'Generate code using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatecode', 'codegen'],
      examples: ['/code a function to sort an array', 'p!code a python hello world'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt') || '';
    const language = interaction.options.getString('language') || 'javascript';

    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for code generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💻 AI Code Generation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Language', value: language, inline: true },
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Generated Code', value: 'This is a placeholder. AI code generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const prompt = args.slice(0, -1).join(' ');
    const language = args[args.length - 1] || 'javascript';

    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for code generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💻 AI Code Generation`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Language', value: language, inline: true },
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Generated Code', value: 'This is a placeholder. AI code generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CodeCommand;
