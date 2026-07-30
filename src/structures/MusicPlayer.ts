// @ts-nocheck
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { COLORS } from '../constants/DesignSystem.js';

export class MusicPlayer {
  public static formatDuration(ms: number): string {
    if (!ms || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  public static getProgressBar(current: number, total: number, length = 20): string {
    if (!total || total <= 0) return '▬'.repeat(length);
    const progress = Math.min(current / total, 1);
    const filled = Math.floor(progress * length);
    const bar = '█'.repeat(filled) + '░'.repeat(length - filled);
    return bar;
  }

  public static getNowPlayingEmbed(player: KazagumoPlayer): EmbedBuilder {
    const track = player.queue.current;
    if (!track) {
      return new EmbedBuilder().setTitle('🎵 Nothing Playing').setColor(COLORS.default).setDescription('The queue is empty.');
    }

    const current = player.position || 0;
    const total = track.length || 0;
    const bar = MusicPlayer.getProgressBar(current, total);
    const currentFmt = MusicPlayer.formatDuration(current);
    const totalFmt = total > 0 ? MusicPlayer.formatDuration(total) : '∞';
    const loopText = player.loop === 'track' ? '🔂 Track' : player.loop === 'queue' ? '🔁 Queue' : '➡️ Off';
    const volumeIcon = (player.volume || 80) > 50 ? '🔊' : (player.volume || 80) > 0 ? '🔉' : '🔇';

    const requester = (track as any).requester;
    const requesterText = requester ? `<@${requester.id || requester}>` : 'Unknown';

    return new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setColor(COLORS.default)
      .setDescription(`**[${track.title}](${track.uri})**\n\`${bar}\`\n\`${currentFmt}\` / \`${totalFmt}\``)
      .addFields(
        { name: '👤 Artist', value: track.author || 'Unknown', inline: true },
        { name: `${volumeIcon} Volume`, value: `${player.volume || 80}%`, inline: true },
        { name: '🔁 Loop', value: loopText, inline: true },
        { name: '🎵 Queue', value: `${player.queue.size} track${player.queue.size !== 1 ? 's' : ''} remaining`, inline: true },
        { name: '📨 Requested by', value: requesterText, inline: true },
      )
      .setThumbnail(track.thumbnail || null)
      .setTimestamp();
  }

  public static getQueueEmbed(player: KazagumoPlayer, page = 1, perPage = 10): EmbedBuilder {
    const queue = player.queue;
    const tracks = [...(queue.size > 0 ? queue : [])];
    const current = queue.current;
    const totalPages = Math.max(1, Math.ceil(tracks.length / perPage));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * perPage;
    const slice = tracks.slice(start, start + perPage);

    const totalDuration = tracks.reduce((acc, t) => acc + (t.length || 0), 0);
    const currentDuration = current?.length || 0;

    const description = slice.length
      ? slice.map((t, i) => `\`${start + i + 1}.\` **[${t.title}](${t.uri})** — \`${MusicPlayer.formatDuration(t.length || 0)}\``).join('\n')
      : 'No tracks in queue.';

    return new EmbedBuilder()
      .setTitle('📋 Music Queue')
      .setColor(COLORS.default)
      .setDescription(current
        ? `▶️ **Now:** [${current.title}](${current.uri}) — \`${MusicPlayer.formatDuration(currentDuration)}\`\n\n${description}`
        : description
      )
      .addFields(
        { name: '🎵 Total Tracks', value: `${tracks.length + (current ? 1 : 0)}`, inline: true },
        { name: '⏱️ Total Duration', value: MusicPlayer.formatDuration(totalDuration + currentDuration), inline: true },
        { name: '🔊 Volume', value: `${player.volume || 80}%`, inline: true },
      )
      .setFooter({ text: `Page ${currentPage}/${totalPages}` });
  }

  public static buildControlButtons(player: KazagumoPlayer): ActionRowBuilder<ButtonBuilder> {
    const isPaused = player.paused;
    const loopMode = player.loop;
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary).setLabel('Prev'),
      new ButtonBuilder().setCustomId('music_pause').setEmoji(isPaused ? '▶️' : '⏸️').setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary).setLabel(isPaused ? 'Resume' : 'Pause'),
      new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setLabel('Skip'),
      new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(loopMode !== 'none' ? ButtonStyle.Success : ButtonStyle.Secondary).setLabel('Loop'),
      new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger).setLabel('Stop'),
    );
  }

  public static buildVolumeButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('music_voldown').setEmoji('🔉').setStyle(ButtonStyle.Secondary).setLabel('Vol-'),
      new ButtonBuilder().setCustomId('music_queue').setEmoji('📋').setStyle(ButtonStyle.Secondary).setLabel('Queue'),
      new ButtonBuilder().setCustomId('music_save').setEmoji('⭐').setStyle(ButtonStyle.Secondary).setLabel('Save'),
      new ButtonBuilder().setCustomId('music_shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary).setLabel('Shuffle'),
      new ButtonBuilder().setCustomId('music_volup').setEmoji('🔊').setStyle(ButtonStyle.Secondary).setLabel('Vol+'),
    );
  }
}
