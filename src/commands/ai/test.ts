import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'test',
      description: 'Generate tests using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatetests', 'unittest'],
      examples: ['/test my code here', 'p!test create unit tests'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code') || '';
    const language = interaction.options.getString('language') || 'javascript';

    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to generate tests for.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🧪 AI Test Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Language', value: language, inline: true },
        { name: 'Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Tests', value: 'This is a placeholder. AI test generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const code = args.slice(0, -1).join(' ');
    const language = args[args.length - 1] || 'javascript';

    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to generate tests for.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🧪 AI Test Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Language', value: language, inline: true },
        { name: 'Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Tests', value: 'This is a placeholder. AI test generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TestCommand;
