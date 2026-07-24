import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SlowModeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'slowmode',
      description: 'Set slowmode for a channel',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ratelimit', 'slow'],
      examples: ['/slowmode #general 5', 'p!slowmode #general 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const duration = interaction.options.getInteger('duration') || 0;

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: '❌ Please provide a valid text channel.', ephemeral: true });
      return;
    }

    if (duration < 0 || duration > 21600) {
      await interaction.reply({ content: '❌ Duration must be between 0 and 21600 seconds (6 hours).', ephemeral: true });
      return;
    }

    try {
      await channel.setRateLimitPerUser(duration, 'Slowmode set by ' + interaction.user.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Slowmode Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Duration', value: duration === 0 ? 'Disabled' : `${duration}s`, inline: true },
          { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set slowmode.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first() || message.channel;
    const duration = parseInt(args[1]) || 0;

    if (!channel || !channel.isTextBased()) {
      await message.reply('❌ Please provide a valid text channel.');
      return;
    }

    if (duration < 0 || duration > 21600) {
      await message.reply('❌ Duration must be between 0 and 21600 seconds (6 hours).');
      return;
    }

    try {
      await channel.setRateLimitPerUser(duration, 'Slowmode set by ' + message.author.tag);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Slowmode Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Duration', value: duration === 0 ? 'Disabled' : `${duration}s`, inline: true },
          { name: 'Updated by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set slowmode.');
    }
  }
}

export default SlowModeCommand;
