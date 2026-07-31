/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Music UI
 *  Premium music player with modern design
 * ═══════════════════════════════════════════════════
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { EmbedManager } from './EmbedManager.js';
import { ButtonManager } from './ButtonManager.js';

// ─── Track Interface ─────────────────────────────────────────────────────────────
export interface Track {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  position: number;
  thumbnail?: string;
  url?: string;
  requester: string;
  source: string;
}

// ─── Player State Interface ─────────────────────────────────────────────────────
export interface PlayerState {
  paused: boolean;
  loop: 'none' | 'track' | 'queue';
  shuffle: boolean;
  volume: number;
  autoplay: boolean;
  nightcore: boolean;
  bassboost: boolean;
  vaporwave: boolean;
}

// ─── Queue Info Interface ───────────────────────────────────────────────────────
export interface QueueInfo {
  currentTrack: Track;
  queue: Track[];
  totalDuration: number;
}

// ─── Premium Music Player Embed ───────────────────────────────────────────────────
export function createMusicPlayerEmbed(
  track: Track,
  state: PlayerState,
  queueInfo: QueueInfo,
  guildName: string
): EmbedBuilder {
  const progress = calculateProgress(track.position, track.duration);
  const progressBar = createProgressBar(progress);
  const timeDisplay = formatTimeDisplay(track.position, track.duration);

  const embed = EmbedManager.music('Now Playing')
    .setDescription(`**[${track.title}](${track.url})**\nby ${track.artist}`)
    .setThumbnail(track.thumbnail || null)
    .addFields(
      {
        name: '🎵 Progress',
        value: `${progressBar}\n\`${timeDisplay.current} / ${timeDisplay.total}\``,
        inline: false,
      },
      {
        name: '🎤 Artist',
        value: track.artist,
        inline: true,
      },
      {
        name: '💿 Album',
        value: track.album || 'Unknown',
        inline: true,
      },
      {
        name: '📀 Source',
        value: track.source,
        inline: true,
      },
      {
        name: '👤 Requested by',
        value: `<@${track.requester}>`,
        inline: true,
      },
      {
        name: '🔊 Volume',
        value: `${state.volume}%`,
        inline: true,
      },
      {
        name: '📜 Queue',
        value: `${queueInfo.queue.length} songs`,
        inline: true,
      },
      {
        name: '⏱️ Total Duration',
        value: formatDuration(queueInfo.totalDuration),
        inline: true,
      },
      {
        name: '🎛️ Controls',
        value: formatControls(state),
        inline: false,
      }
    )
    .setFooter({ text: `${guildName} • Premium Music Player` })
    .setTimestamp();

  return embed;
}

// ─── Calculate Progress Percentage ───────────────────────────────────────────────
function calculateProgress(position: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min(100, Math.max(0, (position / duration) * 100));
}

// ─── Create Progress Bar ───────────────────────────────────────────────────────────
function createProgressBar(progress: number): string {
  const filled = Math.round(progress / 10);
  const empty = 10 - filled;
  return '▬'.repeat(filled) + '🔘' + '▬'.repeat(empty);
}

// ─── Format Time Display ───────────────────────────────────────────────────────────
function formatTimeDisplay(position: number, duration: number): { current: string; total: string } {
  return {
    current: formatDuration(position),
    total: formatDuration(duration),
  };
}

// ─── Format Duration ─────────────────────────────────────────────────────────────
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

// ─── Format Controls Display ──────────────────────────────────────────────────────
function formatControls(state: PlayerState): string {
  const controls: string[] = [];
  
  if (state.paused) controls.push('⏸️ Paused');
  else controls.push('▶️ Playing');
  
  if (state.loop === 'track') controls.push('🔁 Loop Track');
  else if (state.loop === 'queue') controls.push('🔁 Loop Queue');
  
  if (state.shuffle) controls.push('🔀 Shuffle');
  if (state.autoplay) controls.push('🤖 Autoplay');
  if (state.nightcore) controls.push('🎛️ Nightcore');
  if (state.bassboost) controls.push('🎛️ Bassboost');
  if (state.vaporwave) controls.push('🎛️ Vaporwave');

  return controls.join(' • ') || 'No active effects';
}

// ─── Music Player Components ───────────────────────────────────────────────────────
export function createMusicPlayerComponents(
  guildId: string,
  state: PlayerState
): ActionRowBuilder<ButtonBuilder>[] {
  return [
    ButtonManager.musicControl(guildId, {
      paused: state.paused,
      loop: state.loop,
      shuffle: state.shuffle,
    }),
    ButtonManager.musicSecondary(guildId, {
      shuffle: state.shuffle,
      volume: state.volume,
    }),
  ];
}

// ─── Music Filter Components ───────────────────────────────────────────────────────
export function createMusicFilterComponents(guildId: string): ActionRowBuilder<ButtonBuilder> {
  return ButtonManager.musicFilter(guildId);
}

// ─── Queue Embed ─────────────────────────────────────────────────────────────────
export function createQueueEmbed(
  currentTrack: Track,
  queue: Track[],
  state: PlayerState,
  guildName: string,
  page: number = 0,
  pageSize: number = 10
): EmbedBuilder {
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, queue.length);
  const pageQueue = queue.slice(startIndex, endIndex);

  const queueList = pageQueue
    .map((track, index) => {
      const globalIndex = startIndex + index + 1;
      return `**${globalIndex}.** [${track.title}](${track.url})\n   └ ${track.artist} • ${formatDuration(track.duration)}`;
    })
    .join('\n\n');

  const totalDuration = queue.reduce((acc, track) => acc + track.duration, 0);
  const estimatedTime = totalDuration + (currentTrack.duration - currentTrack.position);

  const embed = EmbedManager.queue('Music Queue')
    .setDescription(
      `**Now Playing:** [${currentTrack.title}](${currentTrack.url})\n\n` +
      `**Up Next (${queue.length} songs):**\n${queueList || 'Queue is empty'}`
    )
    .addFields(
      {
        name: '📊 Queue Stats',
        value: `Total songs: ${queue.length}\nTotal duration: ${formatDuration(totalDuration)}\nEstimated finish: ${formatDuration(estimatedTime)}`,
        inline: true,
      },
      {
        name: '🎛️ Settings',
        value: formatControls(state),
        inline: true,
      }
    )
    .setFooter({ text: `Page ${page + 1} • ${guildName}` })
    .setTimestamp();

  return embed;
}

// ─── Send Music Player Response ───────────────────────────────────────────────────
export async function sendMusicPlayer(
  source: ChatInputCommandInteraction | Message,
  track: Track,
  state: PlayerState,
  queueInfo: QueueInfo,
  guildName: string,
  guildId: string
): Promise<Message | null> {
  const embed = createMusicPlayerEmbed(track, state, queueInfo, guildName);
  const components = createMusicPlayerComponents(guildId, state);

  if (source instanceof Message) {
    return await source.reply({ embeds: [embed], components });
  } else {
    await source.reply({ embeds: [embed], components });
    return await source.fetchReply() as Message;
  }
}

// ─── Update Music Player Response ─────────────────────────────────────────────────
export async function updateMusicPlayer(
  message: Message,
  track: Track,
  state: PlayerState,
  queueInfo: QueueInfo,
  guildName: string,
  guildId: string
): Promise<void> {
  const embed = createMusicPlayerEmbed(track, state, queueInfo, guildName);
  const components = createMusicPlayerComponents(guildId, state);

  await message.edit({ embeds: [embed], components });
}

// ─── Send Queue Response ───────────────────────────────────────────────────────────
export async function sendQueue(
  source: ChatInputCommandInteraction | Message,
  currentTrack: Track,
  queue: Track[],
  state: PlayerState,
  guildName: string,
  guildId: string,
  page: number = 0
): Promise<Message | null> {
  const embed = createQueueEmbed(currentTrack, queue, state, guildName, page);
  const components = [
    ButtonManager.navigation(`queue_${guildId}`, page, Math.ceil(queue.length / 10), {
      showFirst: true,
      showLast: true,
      showHome: false,
      showRefresh: false,
      showClose: true,
    }),
  ];

  if (source instanceof Message) {
    return await source.reply({ embeds: [embed], components });
  } else {
    await source.reply({ embeds: [embed], components });
    return await source.fetchReply() as Message;
  }
}

// ─── Music Search Results Embed ───────────────────────────────────────────────────
export function createSearchResultsEmbed(
  query: string,
  results: Track[],
  guildName: string
): EmbedBuilder {
  const resultsList = results
    .map((track, index) => {
      return `**${index + 1}.** [${track.title}](${track.url})\n   └ ${track.artist} • ${formatDuration(track.duration)}`;
    })
    .join('\n\n');

  const embed = EmbedManager.searchResult('Music Search Results')
    .setDescription(`**Query:** ${query}\n\n**Results:**\n${resultsList}`)
    .setFooter({ text: guildName })
    .setTimestamp();

  return embed;
}

// ─── No Results Embed ─────────────────────────────────────────────────────────────
export function createNoResultsEmbed(query: string): EmbedBuilder {
  return EmbedManager.error('No Results Found', `No songs found for "${query}".\n\nTry:\n• Checking your spelling\n• Using different keywords\n• Searching with the artist name`);
}

// ─── Not in Voice Channel Embed ───────────────────────────────────────────────────
export function createNotInVoiceEmbed(): EmbedBuilder {
  return EmbedManager.error(
    'Not in Voice Channel',
    'You need to be in a voice channel to use music commands.\n\n**How to fix:**\n1. Join a voice channel\n2. Run the command again'
  );
}

// ─── No Track Playing Embed ───────────────────────────────────────────────────────
export function createNoTrackPlayingEmbed(): EmbedBuilder {
  return EmbedManager.error(
    'No Track Playing',
    'There is no track currently playing.\n\n**How to fix:**\n• Use `/play` to add a song to the queue\n• Use `/search` to find a song'
  );
}

// ─── Queue Empty Embed ────────────────────────────────────────────────────────────
export function createQueueEmptyEmbed(): EmbedBuilder {
  return EmbedManager.info(
    'Queue is Empty',
    'There are no songs in the queue.\n\n**Next action:**\n• Use `/play` to add a song\n• Use `/search` to find music'
  );
}

// ─── Added to Queue Embed ────────────────────────────────────────────────────────
export function createAddedToQueueEmbed(track: Track, position: number): EmbedBuilder {
  return EmbedManager.success(
    'Added to Queue',
    `**[${track.title}](${track.url})** has been added to the queue at position **${position}**.\n\nArtist: ${track.artist}\nDuration: ${formatDuration(track.duration)}`
  );
}

// ─── Track Started Embed ─────────────────────────────────────────────────────────
export function createTrackStartedEmbed(track: Track): EmbedBuilder {
  return EmbedManager.music(
    'Now Playing',
    `**[${track.title}](${track.url})**\n\nArtist: ${track.artist}\nDuration: ${formatDuration(track.duration)}\nRequested by: <@${track.requester}>`
  ).setThumbnail(track.thumbnail || null);
}

// ─── Track Ended Embed ───────────────────────────────────────────────────────────
export function createTrackEndedEmbed(track: Track): EmbedBuilder {
  return EmbedManager.music(
    'Track Ended',
    `**[${track.title}](${track.url})** has finished playing.`
  );
}

// ─── Export Music UI ────────────────────────────────────────────────────────────
export const MusicUI = {
  createPlayerEmbed: createMusicPlayerEmbed,
  createPlayerComponents: createMusicPlayerComponents,
  createFilterComponents: createMusicFilterComponents,
  createQueueEmbed: createQueueEmbed,
  createSearchResultsEmbed: createSearchResultsEmbed,
  createNoResultsEmbed: createNoResultsEmbed,
  createNotInVoiceEmbed: createNotInVoiceEmbed,
  createNoTrackPlayingEmbed: createNoTrackPlayingEmbed,
  createQueueEmptyEmbed: createQueueEmptyEmbed,
  createAddedToQueueEmbed: createAddedToQueueEmbed,
  createTrackStartedEmbed: createTrackStartedEmbed,
  createTrackEndedEmbed: createTrackEndedEmbed,
  sendPlayer: sendMusicPlayer,
  updatePlayer: updateMusicPlayer,
  sendQueue: sendQueue,
  formatDuration,
  formatControls,
} as const;
