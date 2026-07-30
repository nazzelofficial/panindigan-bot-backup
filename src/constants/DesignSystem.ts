// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Bot Design System
 *  Consistent colors, typography, and design tokens
 * ═══════════════════════════════════════════════════
 */

// ─── Color Palette ─────────────────────────────────────────────────────────
export const COLORS = {
  // Brand Colors
  primary: 0x5865F2,    // Discord Blurple
  secondary: 0x57F287,  // Discord Green
  danger: 0xED4245,     // Discord Red
  warning: 0xFEE75C,    // Discord Yellow
  info: 0x5865F2,       // Discord Blurple
  success: 0x57F287,    // Discord Green
  
  // Category Colors
  music: 0x3B82F6,       // Blue
  economy: 0x10B981,    // Emerald
  moderation: 0xEF4444, // Red
  fun: 0xF59E0B,        // Amber
  games: 0x8B5CF6,      // Violet
  ai: 0x06B6D4,         // Cyan
  social: 0xEC4899,      // Pink
  utility: 0x6B7280,     // Gray
  owner: 0x111827,      // Dark
  premium: 0xF59E0B,    // Gold
  
  // Neutral Colors
  white: 0xFFFFFF,
  light: 0xF3F4F6,
  gray: 0x9CA3AF,
  dark: 0x1F2937,
  black: 0x000000,
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  // Font Sizes (in pixels, Discord uses relative sizing)
  sizes: {
    xs: 0.75,   // 12px
    sm: 0.875,  // 14px
    base: 1,    // 16px
    lg: 1.125,  // 18px
    xl: 1.25,   // 20px
    '2xl': 1.5, // 24px
    '3xl': 1.875, // 30px
  },
  
  // Font Weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

// ─── Animation Durations ───────────────────────────────────────────────────
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ─── Embed Limits ─────────────────────────────────────────────────────────
export const EMBED_LIMITS = {
  title: 256,
  description: 4096,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footer: 2048,
  author: 256,
  total: 6000,
} as const;

// ─── Button Styles ─────────────────────────────────────────────────────────
export const BUTTON_STYLES = {
  primary: {
    style: 'Primary' as const,
    emoji: '✅',
  },
  secondary: {
    style: 'Secondary' as const,
    emoji: '🔘',
  },
  success: {
    style: 'Success' as const,
    emoji: '✅',
  },
  danger: {
    style: 'Danger' as const,
    emoji: '❌',
  },
  link: {
    style: 'Link' as const,
    emoji: '🔗',
  },
} as const;

// ─── Message Templates ─────────────────────────────────────────────────────
export const MESSAGES = {
  success: (message: string) => `✅ ${message}`,
  error: (message: string) => `❌ ${message}`,
  warning: (message: string) => `⚠️ ${message}`,
  info: (message: string) => `ℹ️ ${message}`,
  loading: (message: string) => `⏳ ${message}`,
  
  // Permission Messages
  missingPermissions: 'You do not have the required permissions to use this command.',
  botMissingPermissions: 'The bot does not have the required permissions to perform this action.',
  
  // Cooldown Messages
  cooldown: (seconds: number) => `Please wait ${seconds} seconds before using this command again.`,
  
  // Error Messages
  genericError: 'Something went wrong. Please try again later.',
  notFound: (resource: string) => `The ${resource} you requested could not be found.`,
  
  // Success Messages
  operationSuccess: 'Operation completed successfully.',
  operationCancelled: 'Operation cancelled.',
} as const;

// ─── Emoji Categories (mapped to EmojiManager) ─────────────────────────────
export const EMOJI_CATEGORIES = {
  admin: 'admin',
  ai: 'ai',
  applications: 'applications',
  context: 'context',
  economy: 'economy',
  fun: 'fun',
  games: 'games',
  giveaway: 'giveaway',
  help: 'help',
  image: 'image',
  info: 'info',
  leveling: 'leveling',
  moderation: 'moderation',
  music: 'music',
  owner: 'owner',
  premium: 'premium',
  social: 'social',
  starboard: 'starboard',
  utility: 'utility',
} as const;

// ─── Component Labels ───────────────────────────────────────────────────────
export const COMPONENT_LABELS = {
  // Navigation
  previous: '◀️ Previous',
  next: '▶️ Next',
  first: '⏮️ First',
  last: '⏭️ Last',
  page: (current: number, total: number) => `${current}/${total}`,
  
  // Actions
  confirm: '✅ Confirm',
  cancel: '❌ Cancel',
  delete: '🗑️ Delete',
  edit: '✏️ Edit',
  view: '👁️ View',
  refresh: '🔄 Refresh',
  
  // Music
  play: '▶️ Play',
  pause: '⏸️ Pause',
  stop: '⏹️ Stop',
  skip: '⏭️ Skip',
  previous: '⏮️ Previous',
  shuffle: '🔀 Shuffle',
  loop: '🔁 Loop',
  volume: '🔊 Volume',
  
  // Moderation
  ban: '🔨 Ban',
  kick: '👢 Kick',
  mute: '🔇 Mute',
  unmute: '🔊 Unmute',
  warn: '⚠️ Warn',
  
  // Economy
  deposit: '💰 Deposit',
  withdraw: '🏦 Withdraw',
  transfer: '💸 Transfer',
  
  // General
  yes: '✅ Yes',
  no: '❌ No',
  maybe: '❓ Maybe',
} as const;

// ─── Embed Templates ───────────────────────────────────────────────────────
export const EMBED_TEMPLATES = {
  // Standard embed structure
  standard: {
    color: COLORS.primary,
    timestamp: true,
    footer: { text: 'Panindigan Bot' },
  },
  
  // Success embed
  success: {
    color: COLORS.success,
    timestamp: true,
  },
  
  // Error embed
  error: {
    color: COLORS.danger,
    timestamp: true,
  },
  
  // Warning embed
  warning: {
    color: COLORS.warning,
    timestamp: true,
  },
  
  // Info embed
  info: {
    color: COLORS.info,
    timestamp: true,
  },
  
  // Music embed
  music: {
    color: COLORS.music,
    timestamp: true,
  },
  
  // Economy embed
  economy: {
    color: COLORS.economy,
    timestamp: true,
  },
  
  // Moderation embed
  moderation: {
    color: COLORS.moderation,
    timestamp: true,
  },
  
  // Premium embed
  premium: {
    color: COLORS.premium,
    timestamp: true,
  },
} as const;

// ─── Validation Rules ───────────────────────────────────────────────────────
export const VALIDATION = {
  // Username
  username: {
    minLength: 2,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  
  // Message content
  message: {
    minLength: 1,
    maxLength: 4000,
  },
  
  // Command arguments
  argument: {
    minLength: 1,
    maxLength: 100,
  },
  
  // URLs
  url: {
    pattern: /^https?:\/\/.+/,
  },
  
  // Numbers
  number: {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
  },
} as const;

// ─── Pagination Settings ───────────────────────────────────────────────────
export const PAGINATION = {
  defaultItemsPerPage: 10,
  maxItemsPerPage: 25,
  maxPages: 100,
} as const;

// ─── Rate Limits ───────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  // Global rate limits
  global: {
    requests: 50,
    window: 60, // seconds
  },
  
  // Per-user rate limits
  user: {
    requests: 10,
    window: 60,
  },
  
  // Per-command rate limits
  command: {
    requests: 5,
    window: 60,
  },
} as const;

// ─── Cache Settings ────────────────────────────────────────────────────────
export const CACHE = {
  // Default TTL in seconds
  defaultTTL: 3600, // 1 hour
  
  // Specific TTLs
  user: 1800,       // 30 minutes
  guild: 3600,      // 1 hour
  economy: 300,     // 5 minutes
  music: 600,       // 10 minutes
  api: 1800,        // 30 minutes
} as const;

// ─── Accessibility ────────────────────────────────────────────────────────
export const ACCESSIBILITY = {
  // Minimum contrast ratios (WCAG AA)
  contrastRatios: {
    normal: 4.5,
    large: 3,
  },
  
  // Minimum tap target size (in pixels)
  minTapTarget: 44,
  
  // Screen reader friendly descriptions
  descriptions: {
    button: (label: string) => `Button: ${label}`,
    link: (label: string) => `Link: ${label}`,
    image: (alt: string) => `Image: ${alt}`,
  },
} as const;

// ─── Export Design System ───────────────────────────────────────────────────
export const DESIGN_SYSTEM = {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  EMBED_LIMITS,
  BUTTON_STYLES,
  MESSAGES,
  EMOJI_CATEGORIES,
  COMPONENT_LABELS,
  EMBED_TEMPLATES,
  VALIDATION,
  PAGINATION,
  RATE_LIMITS,
  CACHE,
  ACCESSIBILITY,
} as const;

export default DESIGN_SYSTEM;
