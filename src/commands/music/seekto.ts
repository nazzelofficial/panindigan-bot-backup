import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SeekToCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'seekto',
      description: 'Seek to a specific time in the current song',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['goto', 'jumptotime'],
      examples: ['/seekto 1:30', 'p!seekto 90'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const time = interaction.options.getString('time');

    if (!time) {
      await interaction.reply({ content: '❌ Please provide a time (e.g., 1:30 or 90 seconds).', ephemeral: true });
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
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (!player || !player.currentTrack) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      const position = this.parseTime(time);
      if (position === null) {
        await interaction.reply({ content: '❌ Invalid time format. Use MM:SS or seconds.', ephemeral: true });
        return;
      }

      await musicManager.seek(interaction.guild.id, position);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Seeked to Position`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position', value: this.formatTime(position), inline: true },
          { name: 'Seeked by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to seek.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const time = args[0];

    if (!time) {
      await message.reply('❌ Please provide a time (e.g., 1:30 or 90 seconds).');
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
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (!player || !player.currentTrack) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      const position = this.parseTime(time);
      if (position === null) {
        await message.reply('❌ Invalid time format. Use MM:SS or seconds.');
        return;
      }

      await musicManager.seek(message.guild.id, position);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Seeked to Position`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Position', value: this.formatTime(position), inline: true },
          { name: 'Seeked by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to seek.');
    }
  }

  private parseTime(time: string): number | null {
    if (time.includes(':')) {
      const parts = time.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        if (!isNaN(minutes) && !isNaN(seconds)) {
          return minutes * 60 + seconds;
        }
      }
    } else {
      const seconds = parseInt(time);
      if (!isNaN(seconds)) {
        return seconds;
      }
    }
    return null;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export default SeekToCommand;
