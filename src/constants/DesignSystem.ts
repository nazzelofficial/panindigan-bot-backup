// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Bot Design System  v2
 *  Consistent colors, typography, and design tokens
 *  Fixed duplicate keys · Progress bar helpers
 * ═══════════════════════════════════════════════════
 */

// ─── Color Palette ─────────────────────────────────────────────────────────
export const COLORS = {
  // Brand Colors
  primary:    0x5865F2,  // Discord Blurple
  secondary:  0x57F287,  // Discord Green
  danger:     0xED4245,  // Discord Red
  warning:    0xFEE75C,  // Discord Yellow
  info:       0x5865F2,  // Discord Blurple
  success:    0x57F287,  // Discord Green

  // Category Colors
  music:      0xEB459E,  // Pink (matches EmbedManager)
  economy:    0xF1C40F,  // Gold
  moderation: 0xE74C3C,  // Dark Red
  fun:        0xFF6B6B,  // Coral
  games:      0x2ECC71,  // Emerald
  ai:         0x00ADB5,  // Teal
  social:     0x1ABC9C,  // Turquoise
  utility:    0x95A5A6,  // Gray
  owner:      0x111827,  // Dark
  premium:    0xFFD700,  // Gold

  // Neutral Colors
  white:  0xFFFFFF,
  light:  0xF3F4F6,
  gray:   0x9CA3AF,
  dark:   0x1F2937,
  black:  0x000000,
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  sizes: {
    xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25, '2xl': 1.5, '3xl': 1.875,
  },
  weights: {
    normal: 400, medium: 500, semibold: 600, bold: 700,
  },
  lineHeights: {
    tight: 1.25, normal: 1.5, relaxed: 1.75,
  },
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64,
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────
export const BORDER_RADIUS = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
} as const;

// ─── Animation Durations ───────────────────────────────────────────────────
export const ANIMATION = { fast: 150, normal: 300, slow: 500 } as const;

// ─── Embed Limits ─────────────────────────────────────────────────────────
export const EMBED_LIMITS = {
  title:       256,
  description: 4096,
  fields:      25,
  fieldName:   256,
  fieldValue:  1024,
  footer:      2048,
  author:      256,
  total:       6000,
} as const;

// ─── Button Styles ─────────────────────────────────────────────────────────
export const BUTTON_STYLES = {
  primary:   { style: 'Primary'   as const, emoji: '🔵' },
  secondary: { style: 'Secondary' as const, emoji: '⚪' },
  success:   { style: 'Success'   as const, emoji: '✅' },
  danger:    { style: 'Danger'    as const, emoji: '❌' },
  link:      { style: 'Link'      as const, emoji: '🔗' },
} as const;

// ─── Message Templates ─────────────────────────────────────────────────────
export const MESSAGES = {
  success: (message: string) => `✅ ${message}`,
  error:   (message: string) => `❌ ${message}`,
  warning: (message: string) => `⚠️ ${message}`,
  info:    (message: string) => `ℹ️ ${message}`,
  loading: (message: string) => `⏳ ${message}`,

  // Permission Messages
  missingPermissions:    'You do not have the required permissions to use this command.',
  botMissingPermissions: 'The bot does not have the required permissions to perform this action.',

  // Cooldown / Rate Limit
  cooldown:  (seconds: number) => `⌛ Please wait **${seconds}s** before using this command again.`,
  rateLimit: (seconds: number) => `🚫 Rate limit exceeded. Try again in **${seconds}s**.`,

  // Error Messages
  genericError: 'Something went wrong. Please try again later.',
  notFound:     (resource: string) => `The **${resource}** you requested could not be found.`,

  // Success Messages
  operationSuccess:   'Operation completed successfully.',
  operationCancelled: 'Operation cancelled.',
} as const;

// ─── Progress Bar ──────────────────────────────────────────────────────────
/**
 * Build a premium progress bar string.
 *  filled: '█', empty: '░', 12 segments by default.
 */
export function buildProgressBar(value: number, max: number, length = 12): string {
  const pct    = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(pct * length);
  const empty  = length - filled;
  return `\`${'█'.repeat(filled)}${'░'.repeat(empty)}\` **${Math.round(pct * 100)}%**`;
}

/** Compact loading bar used in LoadingHandler (15 chars wide, shows current step marker). */
export function buildLoadingBar(step: number, total: number): string {
  const pct    = Math.min(1, Math.max(0, step / total));
  const length = 10;
  const filled = Math.round(pct * length);
  const empty  = length - filled;
  const bar    = '▰'.repeat(filled) + '▱'.repeat(empty);
  return `\`${bar}\` **${Math.round(pct * 100)}%**`;
}

// ─── Emoji Categories (mapped to EmojiManager) ─────────────────────────────
export const EMOJI_CATEGORIES = {
  admin: 'admin', ai: 'ai', applications: 'applications', context: 'context',
  economy: 'economy', fun: 'fun', games: 'games', giveaway: 'giveaway',
  help: 'help', image: 'image', info: 'info', leveling: 'leveling',
  moderation: 'moderation', music: 'music', owner: 'owner', premium: 'premium',
  social: 'social', starboard: 'starboard', utility: 'utility',
} as const;

// ─── Component Labels (no duplicate keys) ──────────────────────────────────
export const COMPONENT_LABELS = {
  // Navigation
  previousPage: '◀️ Previous',
  nextPage:     '▶️ Next',
  firstPage:    '⏮️ First',
  lastPage:     '⏭️ Last',
  page: (current: number, total: number) => `${current} / ${total}`,

  // Actions
  confirm: '✅ Confirm',
  cancel:  '❌ Cancel',
  dismiss: '✖️ Dismiss',
  delete:  '🗑️ Delete',
  edit:    '✏️ Edit',
  view:    '👁️ View',
  refresh: '🔄 Refresh',
  close:   '❌ Close',

  // Music transport
  play:     '▶️ Play',
  pause:    '⏸️ Pause',
  resume:   '▶️ Resume',
  stop:     '⏹️ Stop',
  skip:     '⏭️ Skip',
  previous: '⏮️ Previous',
  shuffle:  '🔀 Shuffle',
  loop:     '🔁 Loop',
  volume:   '🔊 Volume',
  queue:    '📜 Queue',
  lyrics:   '🎵 Lyrics',

  // Moderation
  ban:    '🔨 Ban',
  kick:   '👢 Kick',
  mute:   '🔇 Mute',
  unmute: '🔊 Unmute',
  warn:   '⚠️ Warn',
  lock:   '🔒 Lock',
  unlock: '🔓 Unlock',

  // Economy
  deposit:  '💰 Deposit',
  withdraw: '🏦 Withdraw',
  transfer: '💸 Transfer',
  balance:  '👛 Balance',

  // General
  yes:   '✅ Yes',
  no:    '❌ No',
  maybe: '❓ Maybe',
  back:  '◀️ Back',
  home:  '🏠 Home',
  help:  'ℹ️ Help',
} as const;

// ─── Embed Templates ───────────────────────────────────────────────────────
export const EMBED_TEMPLATES = {
  standard:   { color: COLORS.primary,    timestamp: true, footer: { text: '✨ Panindigan' } },
  success:    { color: COLORS.success,    timestamp: true },
  error:      { color: COLORS.danger,     timestamp: true },
  warning:    { color: COLORS.warning,    timestamp: true },
  info:       { color: COLORS.info,       timestamp: true },
  music:      { color: COLORS.music,      timestamp: true },
  economy:    { color: COLORS.economy,    timestamp: true },
  moderation: { color: COLORS.moderation, timestamp: true },
  premium:    { color: COLORS.premium,    timestamp: true },
} as const;

// ─── Validation Rules ───────────────────────────────────────────────────────
export const VALIDATION = {
  username:  { minLength: 2,  maxLength: 32,   pattern: /^[a-zA-Z0-9_]+$/ },
  message:   { minLength: 1,  maxLength: 4000 },
  argument:  { minLength: 1,  maxLength: 100  },
  url:       { pattern: /^https?:\/\/.+/ },
  number:    { min: 0,        max: Number.MAX_SAFE_INTEGER },
} as const;

// ─── Pagination Settings ───────────────────────────────────────────────────
export const PAGINATION = {
  defaultItemsPerPage: 10,
  maxItemsPerPage:     25,
  maxPages:            100,
} as const;

// ─── Rate Limits ───────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  global:  { requests: 50, window: 60 },
  user:    { requests: 10, window: 60 },
  command: { requests:  5, window: 60 },
} as const;

// ─── Cache Settings ────────────────────────────────────────────────────────
export const CACHE = {
  defaultTTL: 3600,
  user:    1800,
  guild:   3600,
  economy:  300,
  music:    600,
  api:     1800,
} as const;

// ─── Accessibility ────────────────────────────────────────────────────────
export const ACCESSIBILITY = {
  contrastRatios: { normal: 4.5, large: 3 },
  minTapTarget:   44,
  descriptions: {
    button: (label: string) => `Button: ${label}`,
    link:   (label: string) => `Link: ${label}`,
    image:  (alt:   string) => `Image: ${alt}`,
  },
} as const;

// ─── Export Design System ───────────────────────────────────────────────────
export const DESIGN_SYSTEM = {
  COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION,
  EMBED_LIMITS, BUTTON_STYLES, MESSAGES, EMOJI_CATEGORIES,
  COMPONENT_LABELS, EMBED_TEMPLATES, VALIDATION, PAGINATION,
  RATE_LIMITS, CACHE, ACCESSIBILITY,
  buildProgressBar, buildLoadingBar,
} as const;

export default DESIGN_SYSTEM;
