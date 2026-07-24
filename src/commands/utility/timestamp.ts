import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TimestampCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'timestamp',
      description: 'Generate a Discord timestamp',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/timestamp', '/timestamp 2024-01-01', 'p!timestamp 2024-12-25'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const dateInput = interaction.options.getString('date');
    const date = dateInput ? new Date(dateInput) : new Date();

    if (isNaN(date.getTime())) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid date format. Use format like YYYY-MM-DD.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const timestamp = Math.floor(date.getTime() / 1000);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Timestamp Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Date', value: date.toLocaleString(), inline: true },
        { name: 'Unix Timestamp', value: `\`${timestamp}\``, inline: false },
        { name: 'Discord Timestamps', value: 
          `Short Time: \`<t:${timestamp}:t>\` → <t:${timestamp}:t>\n` +
          `Long Time: \`<t:${timestamp}:T>\` → <t:${timestamp}:T>\n` +
          `Short Date: \`<t:${timestamp}:d>\` → <t:${timestamp}:d>\n` +
          `Long Date: \`<t:${timestamp}:D>\` → <t:${timestamp}:D>\n` +
          `Relative: \`<t:${timestamp}:R>\` → <t:${timestamp}:R>`,
          inline: false,
        },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const dateInput = args[0];
    const date = dateInput ? new Date(dateInput) : new Date();

    if (isNaN(date.getTime())) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid date format. Use format like YYYY-MM-DD.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const timestamp = Math.floor(date.getTime() / 1000);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Timestamp Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Date', value: date.toLocaleString(), inline: true },
        { name: 'Unix Timestamp', value: `\`${timestamp}\``, inline: false },
        { name: 'Discord Timestamps', value: 
          `Short Time: \`<t:${timestamp}:t>\` → <t:${timestamp}:t>\n` +
          `Long Time: \`<t:${timestamp}:T>\` → <t:${timestamp}:T>\n` +
          `Short Date: \`<t:${timestamp}:d>\` → <t:${timestamp}:d>\n` +
          `Long Date: \`<t:${timestamp}:D>\` → <t:${timestamp}:D>\n` +
          `Relative: \`<t:${timestamp}:R>\` → <t:${timestamp}:R>`,
          inline: false,
        },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TimestampCommand;
