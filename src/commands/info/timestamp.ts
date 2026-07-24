import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TimestampCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'timestamp',
      description: 'Generate a Discord timestamp',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ts'],
      examples: ['/timestamp', '/timestamp 2024-01-01', 'p!timestamp'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const date = interaction.options.getString('date') || new Date().toISOString();

    const timestamp = new Date(date).getTime() / 1000;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Timestamp Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Unix Timestamp', value: `\`${timestamp}\``, inline: false },
        { name: 'Relative Time', value: `<t:${timestamp}:R>`, inline: true },
        { name: 'Short Time', value: `<t:${timestamp}:t>`, inline: true },
        { name: 'Long Time', value: `<t:${timestamp}:T>`, inline: true },
        { name: 'Short Date', value: `<t:${timestamp}:d>`, inline: true },
        { name: 'Long Date', value: `<t:${timestamp}:D>`, inline: true },
        { name: 'Short Date/Time', value: `<t:${timestamp}:f>`, inline: true },
        { name: 'Long Date/Time', value: `<t:${timestamp}:F>`, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const date = args[0] || new Date().toISOString();

    const timestamp = new Date(date).getTime() / 1000;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Timestamp Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Unix Timestamp', value: `\`${timestamp}\``, inline: false },
        { name: 'Relative Time', value: `<t:${timestamp}:R>`, inline: true },
        { name: 'Short Time', value: `<t:${timestamp}:t>`, inline: true },
        { name: 'Long Time', value: `<t:${timestamp}:T>`, inline: true },
        { name: 'Short Date', value: `<t:${timestamp}:d>`, inline: true },
        { name: 'Long Date', value: `<t:${timestamp}:D>`, inline: true },
        { name: 'Short Date/Time', value: `<t:${timestamp}:f>`, inline: true },
        { name: 'Long Date/Time', value: `<t:${timestamp}:F>`, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TimestampCommand;
