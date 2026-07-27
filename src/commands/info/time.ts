// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'time',
      description: 'Display the current time in a specific timezone',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/time Asia/Manila', '/time America/New_York', 'p!time Europe/London'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const timezone = interaction.options.getString('timezone') || 'Asia/Manila';

    try {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', { timeZone: timezone });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🕐 Current Time`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Timezone', value: timezone, inline: true },
          { name: 'Time', value: timeString, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid timezone. Please use IANA timezone format (e.g., Asia/Manila, America/New_York).')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const _args = message.content.split(' ').slice(1);
    const timezone = args[0] || 'Asia/Manila';

    try {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', { timeZone: timezone });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🕐 Current Time`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Timezone', value: timezone, inline: true },
          { name: 'Time', value: timeString, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid timezone. Please use IANA timezone format (e.g., Asia/Manila, America/New_York).')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default TimeCommand;
