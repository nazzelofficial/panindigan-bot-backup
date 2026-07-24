import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class ActivityLogCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'activitylog',
      description: 'Display recent server activity',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['activity'],
      examples: ['/activitylog', 'p!activitylog'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📈 Activity Log`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Activity log will be implemented with database integration.')
      .addFields([
        { name: 'Joins Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Leaves Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Messages Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Most Active Members', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📈 Activity Log`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Activity log will be implemented with database integration.')
      .addFields([
        { name: 'Joins Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Leaves Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Messages Today', value: Formatter.formatNumber(0), inline: true },
        { name: 'Most Active Members', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ActivityLogCommand;
