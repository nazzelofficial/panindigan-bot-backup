/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Embed Manager  v2
 *  Unified, professional, modern embed system
 *  Fixed icons · Default footer & timestamp · Rich builders
 * ═══════════════════════════════════════════════════
 */

import {
  EmbedBuilder,
  EmbedAuthorOptions,
  EmbedFooterOptions,
  Guild,
  User,
} from 'discord.js';
import { emojiManager } from '../utils/EmojiManager.js';

// ─── Premium Color Palette ───────────────────────────────────────────────────────
export const EMBED_COLORS = {
  primary:       0x5865F2,  // Discord blurple
  success:       0x57F287,  // Green
  error:         0xED4245,  // Red
  warning:       0xFEE75C,  // Yellow
  info:          0x5865F2,  // Blurple
  music:         0xEB459E,  // Pink
  economy:       0xF1C40F,  // Gold
  leveling:      0x3498DB,  // Blue
  moderation:    0xE74C3C,  // Dark Red
  admin:         0x9B59B6,  // Purple
  premium:       0xFFD700,  // Gold
  ai:            0x00ADB5,  // Teal
  fun:           0xFF6B6B,  // Coral
  games:         0x2ECC71,  // Emerald
  social:        0x1ABC9C,  // Turquoise
  utility:       0x95A5A6,  // Gray
  logging:       0x7289DA,  // Discord log
  configuration: 0x9B59B6,  // Purple
  dashboard:     0x5865F2,  // Blurple
  ticket:        0x3498DB,  // Blue
  giveaway:      0xF1C40F,  // Gold
  poll:          0x3498DB,  // Blue
  reminder:      0x9B59B6,  // Purple
  statistics:    0x2ECC71,  // Emerald
  analytics:     0x3498DB,  // Blue
  search:        0x5865F2,  // Blurple
  help:          0x5865F2,  // Blurple
  role:          0x9B59B6,  // Purple
  channel:       0x3498DB,  // Blue
} as const;

// ─── Embed Icons — each correctly mapped to its category/key ─────────────────────
export const EMBED_ICONS = {
  // Status
  success:       emojiManager.get('applications', 'approve'),   // ✅
  error:         emojiManager.get('applications', 'reject'),    // ❌
  warning:       emojiManager.get('moderation', 'warn'),        // ⚠️
  info:          emojiManager.get('help', 'info'),              // ℹ️
  loading:       emojiManager.get('utility', 'timer'),          // ⏱️
  confirm:       emojiManager.get('applications', 'approve'),   // ✅
  cancel:        emojiManager.get('applications', 'reject'),    // ❌
  // Categories
  music:         emojiManager.get('music', 'play'),             // ▶️
  economy:       emojiManager.get('economy', 'coins'),          // 💰
  leveling:      emojiManager.get('leveling', 'level'),         // 📈
  moderation:    emojiManager.get('moderation', 'warn'),        // ⚠️
  admin:         emojiManager.get('admin', 'settings'),         // 🛠️
  premium:       emojiManager.get('premium', 'star'),           // ⭐
  ai:            emojiManager.get('ai', 'chat'),                // 🤖
  fun:           emojiManager.get('fun', 'dice'),               // 🎲
  games:         emojiManager.get('games', 'tic_tac_toe'),      // ⭕
  social:        emojiManager.get('social', 'profile'),         // 👤
  utility:       emojiManager.get('utility', 'search'),         // 🔍
  logging:       emojiManager.get('help', 'info'),              // ℹ️
  configuration: emojiManager.get('admin', 'config'),           // ⚙️
  dashboard:     emojiManager.get('owner', 'stats'),            // 📊
  ticket:        emojiManager.get('applications', 'create'),    // 📝
  giveaway:      emojiManager.get('giveaway', 'gift'),          // 🎁
  poll:          emojiManager.get('utility', 'poll'),           // 📊
  reminder:      emojiManager.get('utility', 'reminder'),       // ⏰
  statistics:    emojiManager.get('owner', 'stats'),            // 📊
  analytics:     emojiManager.get('owner', 'stats'),            // 📊
  search:        emojiManager.get('utility', 'search'),         // 🔍
  help:          emojiManager.get('help', 'info'),              // ℹ️
  // Info
  role:          emojiManager.get('info', 'role'),              // 🎭
  channel:       emojiManager.get('info', 'channel'),           // #️⃣
  user:          emojiManager.get('info', 'user'),              // 👤
  server:        emojiManager.get('info', 'server'),            // 🏠
  // Music controls
  queue:         emojiManager.get('music', 'queue'),            // 📜
  stop:          emojiManager.get('music', 'stop'),             // ⏹️
  previous:      emojiManager.get('music', 'previous'),         // ⏮️
  next:          emojiManager.get('music', 'skip'),             // ⏭️
  // Navigation
  home:          emojiManager.get('info', 'server'),            // 🏠
  details:       emojiManager.get('help', 'info'),              // ℹ️
  // Actions
  settings:      emojiManager.get('admin', 'settings'),         // 🛠️
  save:          emojiManager.get('admin', 'settings'),         // 🛠️
  edit:          emojiManager.get('image', 'edit'),             // ✏️
  add:           emojiManager.get('admin', 'settings'),         // 🛠️
  remove:        emojiManager.get('admin', 'purge'),            // 🧹
  delete:        emojiManager.get('admin', 'purge'),            // 🧹
  refresh:       emojiManager.get('owner', 'reload'),           // 🔄
  close:         emojiManager.get('applications', 'reject'),    // ❌
  // Decorative
  favorite:      emojiManager.get('social', 'rep'),             // 👍
  pin:           emojiManager.get('starboard', 'star'),         // ⭐
  export:        emojiManager.get('admin', 'settings'),         // 🛠️
  import:        emojiManager.get('admin', 'settings'),         // 🛠️
  star:          emojiManager.get('premium', 'star'),           // ⭐
  crown:         emojiManager.get('premium', 'crown'),          // 👑
  gem:           emojiManager.get('premium', 'gem'),            // 💎
  fire:          emojiManager.get('premium', 'star'),           // ⭐
  sparkle:       emojiManager.get('premium', 'star'),           // ⭐
} as const;

// ─── Embed Options Interface ─────────────────────────────────────────────────────
export interface EmbedOptions {
  title?: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  author?: EmbedAuthorOptions;
  footer?: EmbedFooterOptions | null;  // null = suppress default footer
  thumbnail?: string;
  image?: string;
  url?: string;
  timestamp?: boolean | Date;          // false = suppress; default = always show
}

// ─── Base Embed Builder ───────────────────────────────────────────────────────────
function baseEmbed(color: number, options: EmbedOptions = {}): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(color);

  if (options.title)              embed.setTitle(options.title);
  if (options.description)        embed.setDescription(options.description);
  if (options.fields?.length)     embed.addFields(options.fields);
  if (options.author)             embed.setAuthor(options.author);
  if (options.thumbnail)          embed.setThumbnail(options.thumbnail);
  if (options.image)              embed.setImage(options.image);
  if (options.url)                embed.setURL(options.url);

  // Standard footer — default '✨ Panindigan'; pass null to suppress
  if (options.footer !== null) {
    embed.setFooter(options.footer ?? { text: '✨ Panindigan' });
  }

  // Standard timestamp — always on unless explicitly false
  if (options.timestamp !== false) {
    embed.setTimestamp(options.timestamp instanceof Date ? options.timestamp : undefined);
  }

  return embed;
}

// ─── Progress Bar helper ─────────────────────────────────────────────────────────
/**
 * Build a visual progress bar string for use in embed fields.
 * @param value  current value
 * @param max    maximum value
 * @param length number of segments (default 12)
 */
export function buildProgressBar(value: number, max: number, length = 12): string {
  const pct    = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(pct * length);
  const empty  = length - filled;
  const bar    = '█'.repeat(filled) + '░'.repeat(empty);
  const pctStr = `${Math.round(pct * 100)}%`;
  return `\`${bar}\` **${pctStr}**`;
}

// ─── Relative Discord timestamp helper ───────────────────────────────────────────
/** Returns a Discord relative timestamp string, e.g. `<t:1234567890:R>` */
export function discordTimestamp(date: Date | number, style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R' = 'R'): string {
  const ts = typeof date === 'number' ? Math.floor(date / 1000) : Math.floor(date.getTime() / 1000);
  return `<t:${ts}:${style}>`;
}

// ─── Success Embed ────────────────────────────────────────────────────────────────
export function successEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.success, {
    title: `${EMBED_ICONS.success} ${title}`,
    description,
    ...options,
  });
}

// ─── Error Embed ──────────────────────────────────────────────────────────────────
export function errorEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.error, {
    title: `${EMBED_ICONS.error} ${title}`,
    description,
    ...options,
  });
}

// ─── Warning Embed ───────────────────────────────────────────────────────────────
export function warningEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.warning, {
    title: `${EMBED_ICONS.warning} ${title}`,
    description,
    ...options,
  });
}

// ─── Info Embed ──────────────────────────────────────────────────────────────────
export function infoEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.info, {
    title: `${EMBED_ICONS.info} ${title}`,
    description,
    ...options,
  });
}

// ─── Loading Embed ───────────────────────────────────────────────────────────────
export function loadingEmbed(
  action: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.info, {
    title: `${EMBED_ICONS.loading} ${action}`,
    description: description ?? 'Please wait…',
    ...options,
  });
}

// ─── Confirmation Embed ───────────────────────────────────────────────────────────
export function confirmationEmbed(
  title: string,
  description: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.warning, {
    title: `${EMBED_ICONS.warning} ${title}`,
    description: `${description}\n\n> ⚠️ *This action cannot be undone.*`,
    ...options,
  });
}

// ─── AI Embed ─────────────────────────────────────────────────────────────────────
export function aiEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.ai, {
    title: `${EMBED_ICONS.ai} ${title}`,
    description,
    ...options,
  });
}

// ─── Music Embed ──────────────────────────────────────────────────────────────────
export function musicEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.music, {
    title: `${EMBED_ICONS.music} ${title}`,
    description,
    ...options,
  });
}

// ─── Queue Embed ─────────────────────────────────────────────────────────────────
export function queueEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.music, {
    title: `${EMBED_ICONS.queue} ${title}`,
    description,
    ...options,
  });
}

// ─── Premium Embed ───────────────────────────────────────────────────────────────
export function premiumEmbed(
  title: string,
  description?: string,
  tier?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  const tierEmojis: Record<string, string> = {
    free: '🆓', bronze: '🥉', silver: '⭐', gold: '💎', diamond: '👑',
  };
  const tierColors: Record<string, number> = {
    free: EMBED_COLORS.premium, bronze: 0xCD7F32,
    silver: 0xC0C0C0, gold: EMBED_COLORS.premium, diamond: 0xB9F2FF,
  };

  const icon  = tier ? tierEmojis[tier]   : EMBED_ICONS.premium;
  const color = tier ? tierColors[tier]   : EMBED_COLORS.premium;

  return baseEmbed(color, {
    title: `${icon} ${title}`,
    description,
    ...options,
  });
}

// ─── Utility Embed ────────────────────────────────────────────────────────────────
export function utilityEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.utility, {
    title: `${EMBED_ICONS.utility} ${title}`,
    description,
    ...options,
  });
}

// ─── Moderation Embed ─────────────────────────────────────────────────────────────
export function moderationEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.moderation, {
    title: `${EMBED_ICONS.moderation} ${title}`,
    description,
    ...options,
  });
}

// ─── Economy Embed ───────────────────────────────────────────────────────────────
export function economyEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.economy, {
    title: `${EMBED_ICONS.economy} ${title}`,
    description,
    ...options,
  });
}

// ─── Logging Embed ───────────────────────────────────────────────────────────────
export function loggingEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.logging, {
    title: `${EMBED_ICONS.logging} ${title}`,
    description,
    ...options,
  });
}

// ─── Configuration Embed ─────────────────────────────────────────────────────────
export function configurationEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.configuration, {
    title: `${EMBED_ICONS.configuration} ${title}`,
    description,
    ...options,
  });
}

// ─── Dashboard Embed ─────────────────────────────────────────────────────────────
export function dashboardEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.dashboard, {
    title: `${EMBED_ICONS.dashboard} ${title}`,
    description,
    ...options,
  });
}

// ─── User Embed ───────────────────────────────────────────────────────────────────
export function userEmbed(
  title: string,
  user?: User,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description' | 'thumbnail'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.primary, {
    title: `${EMBED_ICONS.user} ${title}`,
    description,
    thumbnail: user?.displayAvatarURL({ size: 512 }),
    ...options,
  });
}

// ─── Server Embed ────────────────────────────────────────────────────────────────
export function serverEmbed(
  title: string,
  guild?: Guild,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description' | 'thumbnail'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.primary, {
    title: `${EMBED_ICONS.server} ${title}`,
    description,
    thumbnail: guild?.iconURL({ size: 512 }) ?? undefined,
    ...options,
  });
}

// ─── Role Embed ──────────────────────────────────────────────────────────────────
export function roleEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.role, {
    title: `${EMBED_ICONS.role} ${title}`,
    description,
    ...options,
  });
}

// ─── Channel Embed ───────────────────────────────────────────────────────────────
export function channelEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.channel, {
    title: `${EMBED_ICONS.channel} ${title}`,
    description,
    ...options,
  });
}

// ─── Ticket Embed ────────────────────────────────────────────────────────────────
export function ticketEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.ticket, {
    title: `${EMBED_ICONS.ticket} ${title}`,
    description,
    ...options,
  });
}

// ─── Giveaway Embed ───────────────────────────────────────────────────────────────
export function giveawayEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.giveaway, {
    title: `${EMBED_ICONS.giveaway} ${title}`,
    description,
    ...options,
  });
}

// ─── Poll Embed ───────────────────────────────────────────────────────────────────
export function pollEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.poll, {
    title: `${EMBED_ICONS.poll} ${title}`,
    description,
    ...options,
  });
}

// ─── Reminder Embed ───────────────────────────────────────────────────────────────
export function reminderEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.reminder, {
    title: `${EMBED_ICONS.reminder} ${title}`,
    description,
    ...options,
  });
}

// ─── Statistics Embed ─────────────────────────────────────────────────────────────
export function statisticsEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.statistics, {
    title: `${EMBED_ICONS.statistics} ${title}`,
    description,
    ...options,
  });
}

// ─── Analytics Embed ──────────────────────────────────────────────────────────────
export function analyticsEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.analytics, {
    title: `${EMBED_ICONS.analytics} ${title}`,
    description,
    ...options,
  });
}

// ─── Search Result Embed ──────────────────────────────────────────────────────────
export function searchResultEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.search, {
    title: `${EMBED_ICONS.search} ${title}`,
    description,
    ...options,
  });
}

// ─── Help Embed ───────────────────────────────────────────────────────────────────
export function helpEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.help, {
    title: `${EMBED_ICONS.help} ${title}`,
    description,
    ...options,
  });
}

// ─── Leveling Embed ───────────────────────────────────────────────────────────────
export function levelingEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.leveling, {
    title: `${EMBED_ICONS.leveling} ${title}`,
    description,
    ...options,
  });
}

// ─── Admin Embed ──────────────────────────────────────────────────────────────────
export function adminEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.admin, {
    title: `${EMBED_ICONS.admin} ${title}`,
    description,
    ...options,
  });
}

// ─── Fun Embed ────────────────────────────────────────────────────────────────────
export function funEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.fun, {
    title: `${EMBED_ICONS.fun} ${title}`,
    description,
    ...options,
  });
}

// ─── Games Embed ─────────────────────────────────────────────────────────────────
export function gamesEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.games, {
    title: `${EMBED_ICONS.games} ${title}`,
    description,
    ...options,
  });
}

// ─── Social Embed ────────────────────────────────────────────────────────────────
export function socialEmbed(
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(EMBED_COLORS.social, {
    title: `${EMBED_ICONS.social} ${title}`,
    description,
    ...options,
  });
}

// ─── Custom Embed ────────────────────────────────────────────────────────────────
export function customEmbed(
  color: number,
  title: string,
  description?: string,
  options: Omit<EmbedOptions, 'title' | 'description'> = {}
): EmbedBuilder {
  return baseEmbed(color, { title, description, ...options });
}

// ─── Moderation Action Embed ──────────────────────────────────────────────────────
export function moderationActionEmbed(
  action: string,
  target: { tag: string; id: string },
  moderator: { tag: string; id: string },
  reason: string,
  caseId?: number,
  duration?: string
): EmbedBuilder {
  const actionEmojis: Record<string, string> = {
    ban: '🔨', kick: '👢', mute: '🔇', warn: '⚠️',
    unban: '🔓', unmute: '🔊', softban: '⚡', tempban: '⏱️',
    note: '📝', timeout: '⏰', lock: '🔒', unlock: '🔓',
  };

  const emoji       = actionEmojis[action.toLowerCase()] ?? '🛡️';
  const actionTitle = action.charAt(0).toUpperCase() + action.slice(1);

  return baseEmbed(EMBED_COLORS.moderation, {
    title: `${emoji} ${actionTitle}`,
    fields: [
      { name: '👤 User',        value: `<@${target.id}> — \`${target.tag}\` (${target.id})`, inline: true },
      { name: '🛡️ Moderator',  value: `<@${moderator.id}> — \`${moderator.tag}\``,          inline: true },
      ...(duration ? [{ name: '⏱️ Duration', value: duration, inline: true }] : []),
      { name: '📝 Reason',      value: reason,                                               inline: false },
      ...(caseId !== undefined ? [{ name: '📋 Case', value: `#${caseId}`, inline: true }] : []),
    ],
  });
}

// ─── Now Playing Embed ────────────────────────────────────────────────────────────
export function nowPlayingEmbed(opts: {
  title: string;
  author?: string;
  uri?: string;
  thumbnail?: string;
  duration?: number;
  position?: number;
  requester?: string;
  loop?: 'none' | 'track' | 'queue';
  volume?: number;
}): EmbedBuilder {
  const { title, author, uri, thumbnail, duration, position, requester, loop, volume } = opts;

  const loopEmoji = loop === 'track' ? '🔂' : loop === 'queue' ? '🔁' : '➡️';
  const volEmoji  = (volume ?? 100) > 66 ? '🔊' : (volume ?? 100) > 33 ? '🔉' : '🔈';

  const fields: { name: string; value: string; inline?: boolean }[] = [];

  if (duration && position !== undefined) {
    const bar = buildProgressBar(position, duration, 14);
    fields.push({ name: '⏱️ Progress', value: bar, inline: false });
  }

  if (author)    fields.push({ name: '🎤 Artist',    value: author,                          inline: true });
  if (requester) fields.push({ name: '👤 Requested', value: `<@${requester}>`,               inline: true });
  if (volume !== undefined) fields.push({ name: `${volEmoji} Volume`, value: `${volume}%`,   inline: true });
  if (loop !== undefined)   fields.push({ name: `${loopEmoji} Loop`,  value: loop ?? 'none', inline: true });

  return baseEmbed(EMBED_COLORS.music, {
    title: `🎵 ${title}`,
    url: uri,
    thumbnail,
    fields,
  });
}

// ─── Export all embed builders ─────────────────────────────────────────────────────
export const EmbedManager = {
  success:          successEmbed,
  error:            errorEmbed,
  warning:          warningEmbed,
  info:             infoEmbed,
  loading:          loadingEmbed,
  confirmation:     confirmationEmbed,
  ai:               aiEmbed,
  music:            musicEmbed,
  queue:            queueEmbed,
  premium:          premiumEmbed,
  utility:          utilityEmbed,
  moderation:       moderationEmbed,
  economy:          economyEmbed,
  logging:          loggingEmbed,
  configuration:    configurationEmbed,
  dashboard:        dashboardEmbed,
  user:             userEmbed,
  server:           serverEmbed,
  role:             roleEmbed,
  channel:          channelEmbed,
  ticket:           ticketEmbed,
  giveaway:         giveawayEmbed,
  poll:             pollEmbed,
  reminder:         reminderEmbed,
  statistics:       statisticsEmbed,
  analytics:        analyticsEmbed,
  searchResult:     searchResultEmbed,
  help:             helpEmbed,
  leveling:         levelingEmbed,
  admin:            adminEmbed,
  fun:              funEmbed,
  games:            gamesEmbed,
  social:           socialEmbed,
  custom:           customEmbed,
  moderationAction: moderationActionEmbed,
  nowPlaying:       nowPlayingEmbed,
  progressBar:      buildProgressBar,
  timestamp:        discordTimestamp,
  colors:           EMBED_COLORS,
  icons:            EMBED_ICONS,
} as const;
