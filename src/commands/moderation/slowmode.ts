// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class SlowmodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'slowmode',
      description: 'Set slowmode for the current channel',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ratelimit', 'cooldown'],
      examples: ['/slowmode 10s', 'p!slowmode off'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const duration = interaction.options.getString('duration') || 'off';

    if (!interaction.channel || !interaction.channel.isTextBased()) return;

    try {
      let slowmodeSeconds = 0;

      if (duration.toLowerCase() === 'off' || duration === '0') {
        slowmodeSeconds = 0;
      } else {
        slowmodeSeconds = Formatter.parseTime(duration);
        if (slowmodeSeconds <= 0) {
          await interaction.reply({ content: '❌ Invalid duration format. Use format like 10s, 1m, 1h, or "off".', ephemeral: true });
          return;
        }
        if (slowmodeSeconds > 21600) {
          await interaction.reply({ content: '❌ Slowmode cannot exceed 6 hours.', ephemeral: true });
          return;
        }
      }

      await interaction.channel.setRateLimitPerUser(Math.floor(slowmodeSeconds));

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Slowmode Updated`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Channel', value: interaction.channel.toString(), inline: true },
          { name: 'Slowmode', value: slowmodeSeconds === 0 ? 'Off' : Formatter.formatDuration(slowmodeSeconds), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set slowmode.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const duration = args[0] || 'off';

    if (!message.channel || !message.channel.isTextBased()) return;

    try {
      let slowmodeSeconds = 0;

      if (duration.toLowerCase() === 'off' || duration === '0') {
        slowmodeSeconds = 0;
      } else {
        slowmodeSeconds = Formatter.parseTime(duration);
        if (slowmodeSeconds <= 0) {
          await message.reply('❌ Invalid duration format. Use format like 10s, 1m, 1h, or "off".');
          return;
        }
        if (slowmodeSeconds > 21600) {
          await message.reply('❌ Slowmode cannot exceed 6 hours.');
          return;
        }
      }

      await message.channel.setRateLimitPerUser(Math.floor(slowmodeSeconds));

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.moderation} Slowmode Updated`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Channel', value: message.channel.toString(), inline: true },
          { name: 'Slowmode', value: slowmodeSeconds === 0 ? 'Off' : Formatter.formatDuration(slowmodeSeconds), inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set slowmode.');
    }
  }
}

export default SlowmodeCommand;
