import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'time',
      description: 'Display the current time in a timezone',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/time', '/time Asia/Manila', 'p!time America/New_York'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const timezone = interaction.options.getString('timezone') || 'UTC';

    try {
      const time = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🕐 Current Time`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Timezone', value: timezone, inline: true },
          { name: 'Time', value: time, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid timezone. Use format like "Asia/Manila" or "America/New_York".')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const timezone = args[0] || 'UTC';

    try {
      const time = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🕐 Current Time`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Timezone', value: timezone, inline: true },
          { name: 'Time', value: time, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid timezone. Use format like "Asia/Manila" or "America/New_York".')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default TimeCommand;
