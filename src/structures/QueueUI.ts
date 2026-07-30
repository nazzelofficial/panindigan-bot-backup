/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Queue UI
 *  Modern queue display with comprehensive info
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
import { MusicUI, Track, PlayerState } from './MusicUI.js';

// ─── Queue Display Options ─────────────────────────────────────────────────────
export interface QueueDisplayOptions {
  showNowPlaying?: boolean;
  showUpcoming?: boolean;
  showStats?: boolean;
  showControls?: boolean;
  pageSize?: number;
}

// ─── Comprehensive Queue Embed ───────────────────────────────────────────────────
export function createComprehensiveQueueEmbed(
  currentTrack: Track,
  queue: Track[],
  state: PlayerState,
  guildName: string,
  options: QueueDisplayOptions = {}
): EmbedBuilder {
  const {
    showNowPlaying = true,
    showUpcoming = true,
    showStats = true,
    showControls = true,
  } = options;

  const embed = EmbedManager.queue('Music Queue');
  const fields: { name: string; value: string; inline?: boolean }[] = [];

  // Now Playing Section
  if (showNowPlaying && currentTrack) {
    fields.push({
      name: '🎵 Now Playing',
      value: `**[${currentTrack.title}](${currentTrack.url})**\nby ${currentTrack.artist}\n${MusicUI.formatDuration(currentTrack.position)} / ${MusicUI.formatDuration(currentTrack.duration)}`,
      inline: false,
    });
  }

  // Upcoming Songs Section
  if (showUpcoming && queue.length > 0) {
    const upcomingSongs = queue.slice(0, 5)
      .map((track, index) => `**${index + 1}.** ${track.title} - ${track.artist}`)
      .join('\n');

    fields.push({
      name: `📜 Up Next (${queue.length} songs)`,
      value: upcomingSongs + (queue.length > 5 ? `\n... and ${queue.length - 5} more` : ''),
      inline: false,
    });
  }

  // Queue Statistics
  if (showStats) {
    const totalDuration = queue.reduce((acc, track) => acc + track.duration, 0);
    const estimatedTime = totalDuration + (currentTrack ? currentTrack.duration - currentTrack.position : 0);

    fields.push({
      name: '📊 Queue Statistics',
      value: `Total songs: ${queue.length}\nTotal duration: ${MusicUI.formatDuration(totalDuration)}\nEstimated finish: ${MusicUI.formatDuration(estimatedTime)}`,
      inline: true,
    });
  }

  // Controls Display
  if (showControls) {
    fields.push({
      name: '🎛️ Active Controls',
      value: MusicUI.formatControls(state),
      inline: true,
    });
  }

  embed.addFields(...fields);
  embed.setFooter({ text: guildName });
  embed.setTimestamp();

  return embed;
}

// ─── Mini Queue Embed (Compact) ───────────────────────────────────────────────────
export function createMiniQueueEmbed(
  currentTrack: Track,
  queue: Track[],
  guildName: string
): EmbedBuilder {
  const queuePreview = queue.slice(0, 3)
    .map((track, index) => `${index + 1}. ${track.title}`)
    .join('\n');

  const embed = EmbedManager.queue('Queue')
    .setDescription(
      `**Now Playing:** ${currentTrack.title}\n\n` +
      `**Up Next:**\n${queuePreview || 'Queue is empty'}${queue.length > 3 ? `\n... and ${queue.length - 3} more` : ''}`
    )
    .addFields(
      {
        name: 'Queue Size',
        value: `${queue.length} songs`,
        inline: true,
      },
      {
        name: 'Total Duration',
        value: MusicUI.formatDuration(queue.reduce((acc, t) => acc + t.duration, 0)),
        inline: true,
      }
    )
    .setFooter({ text: guildName })
    .setTimestamp();

  return embed;
}

// ─── Queue Action Components ───────────────────────────────────────────────────────
export function createQueueActionComponents(
  guildId: string,
  state: PlayerState
): ActionRowBuilder<ButtonBuilder>[] {
  return [
    ButtonManager.musicSecondary(guildId, {
      shuffle: state.shuffle,
      volume: state.volume,
    }),
  ];
}

// ─── Queue Management Components ─────────────────────────────────────────────────
export function createQueueManagementComponents(prefix: string): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${prefix}_shuffle`)
        .setLabel('Shuffle')
        .setEmoji('🔀')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`${prefix}_clear`)
        .setLabel('Clear')
        .setEmoji('🧹')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`${prefix}_save`)
        .setLabel('Save')
        .setEmoji('💾')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${prefix}_close`)
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

// ─── Send Comprehensive Queue ────────────────────────────────────────────────────
export async function sendComprehensiveQueue(
  source: ChatInputCommandInteraction | Message,
  currentTrack: Track,
  queue: Track[],
  state: PlayerState,
  guildName: string,
  guildId: string,
  options: QueueDisplayOptions = {}
): Promise<Message | null> {
  const embed = createComprehensiveQueueEmbed(currentTrack, queue, state, guildName, options);
  const components = createQueueActionComponents(guildId, state);

  if (source instanceof Message) {
    return await source.reply({ embeds: [embed], components });
  } else {
    await source.reply({ embeds: [embed], components });
    return await source.fetchReply() as Message;
  }
}

// ─── Send Mini Queue ─────────────────────────────────────────────────────────────
export async function sendMiniQueue(
  source: ChatInputCommandInteraction | Message,
  currentTrack: Track,
  queue: Track[],
  guildName: string
): Promise<Message | null> {
  const embed = createMiniQueueEmbed(currentTrack, queue, guildName);

  if (source instanceof Message) {
    return await source.reply({ embeds: [embed] });
  } else {
    await source.reply({ embeds: [embed] });
    return await source.fetchReply() as Message;
  }
}

// ─── Queue Added Embed ───────────────────────────────────────────────────────────
export function createQueueAddedEmbed(
  track: Track,
  position: number,
  queueSize: number
): EmbedBuilder {
  return EmbedManager.success(
    'Added to Queue',
    `**[${track.title}](${track.url})** has been added to position **${position}**.\n\n` +
    `Artist: ${track.artist}\n` +
    `Duration: ${MusicUI.formatDuration(track.duration)}\n` +
    `Queue size: ${queueSize} songs`
  );
}

// ─── Queue Removed Embed ─────────────────────────────────────────────────────────
export function createQueueRemovedEmbed(
  track: Track,
  position: number,
  queueSize: number
): EmbedBuilder {
  return EmbedManager.success(
    'Removed from Queue',
    `**[${track.title}](${track.url})** has been removed from position **${position}**.\n\n` +
    `Artist: ${track.artist}\n` +
    `Queue size: ${queueSize} songs`
  );
}

// ─── Queue Cleared Embed ─────────────────────────────────────────────────────────
export function createQueueClearedEmbed(count: number): EmbedBuilder {
  return EmbedManager.success(
    'Queue Cleared',
    `${count} songs have been removed from the queue.\n\n**Next action:**\n• Use /play to add new songs`
  );
}

// ─── Queue Shuffled Embed ─────────────────────────────────────────────────────
export function createQueueShuffledEmbed(): EmbedBuilder {
  return EmbedManager.success(
    'Queue Shuffled',
    'The queue has been shuffled randomly.\n\n**Next action:**\n• Use /queue to view the new order'
  );
}

// ─── Queue Saved Embed ─────────────────────────────────────────────────────────
export function createQueueSavedEmbed(name: string, count: number): EmbedBuilder {
  return EmbedManager.success(
    'Queue Saved',
    `Playlist **${name}** has been saved with ${count} songs.\n\n**Next action:**\n• Use /playlist load to load this playlist`
  );
}

// ─── Export Queue UI ────────────────────────────────────────────────────────────
export const QueueUI = {
  createComprehensive: createComprehensiveQueueEmbed,
  createMini: createMiniQueueEmbed,
  createActionComponents: createQueueActionComponents,
  createManagementComponents: createQueueManagementComponents,
  sendComprehensive: sendComprehensiveQueue,
  sendMini: sendMiniQueue,
  createAddedEmbed: createQueueAddedEmbed,
  createRemovedEmbed: createQueueRemovedEmbed,
  createClearedEmbed: createQueueClearedEmbed,
  createShuffledEmbed: createQueueShuffledEmbed,
  createSavedEmbed: createQueueSavedEmbed,
} as const;
