import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RefactorCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'refactor',
      description: 'Refactor code using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['refactorcode', 'restructure'],
      examples: ['/refactor my code here', 'p!refactor improve structure'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code') || '';
    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to refactor.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🔄 AI Code Refactorer`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Refactored Code', value: 'This is a placeholder. AI code refactoring will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const code = args.join(' ');

    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to refactor.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🔄 AI Code Refactorer`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Original Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Refactored Code', value: 'This is a placeholder. AI code refactoring will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RefactorCommand;
