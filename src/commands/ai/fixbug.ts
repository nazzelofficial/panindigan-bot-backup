import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FixBugCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'fixbug',
      description: 'Fix bugs in code using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bugfix', 'repair'],
      examples: ['/fixbug my code here', 'p!fixbug this has an error'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code') || '';
    const error = interaction.options.getString('error') || '';

    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to fix bugs in.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🐛 AI Bug Fixer`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Error', value: error || 'None specified', inline: false },
        { name: 'Fix', value: 'This is a placeholder. AI bug fixing will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const code = args.slice(0, -1).join(' ');
    const error = args[args.length - 1] || '';

    if (!code) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide code to fix bugs in.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🐛 AI Bug Fixer`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Code', value: code.substring(0, 500) + (code.length > 500 ? '...' : ''), inline: false },
        { name: 'Error', value: error || 'None specified', inline: false },
        { name: 'Fix', value: 'This is a placeholder. AI bug fixing will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default FixBugCommand;
