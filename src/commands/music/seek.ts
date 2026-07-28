// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SeekCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'seek',
      description: 'Seek to a specific position in the current song',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['position', 'goto'],
      examples: ['/seek 1:30', 'p!seek 90'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const position = interaction.options.getString('position');

    if (!position) {
      await interaction.reply({ content: '❌ Please provide a position (e.g., 1:30 or 90 for seconds).', ephemeral: true });
      return;
    }

    const seconds = this.parsePosition(position);

    if (seconds === null) {
      await interaction.reply({ content: '❌ Invalid position format. Use MM:SS or seconds.', ephemeral: true });
      return;
    }

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to seek.', ephemeral: true });
      return;
    }

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (!player || !player.queue.current) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      await player.seek(seconds);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Seeked`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position', value: this.formatTime(seconds), inline: true },
          { name: 'Seeked by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to seek.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const position = args[0];

    if (!position) {
      await message.reply('❌ Please provide a position (e.g., 1:30 or 90 for seconds).');
      return;
    }

    const seconds = this.parsePosition(position);

    if (seconds === null) {
      await message.reply('❌ Invalid position format. Use MM:SS or seconds.');
      return;
    }

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to seek.');
      return;
    }

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (!player || !player.queue.current) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceId !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      await player.seek(seconds);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Seeked`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position', value: this.formatTime(seconds), inline: true },
          { name: 'Seeked by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to seek.');
    }
  }

  private parsePosition(position: string): number | null {
    if (position.includes(':')) {
      const parts = position.split(':').map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    } else {
      const seconds = parseInt(position);
      if (!isNaN(seconds)) return seconds;
    }
    return null;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
}

export default SeekCommand;
