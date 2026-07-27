// @ts-nocheck
import { PermissionFlagsBits } from 'discord.js';

export const EMOJIS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  music: '🎵',
  economy: '💰',
  games: '🎮',
  fun: '🎉',
  ai: '🤖',
  moderation: '🛡️',
  admin: '👑',
  utility: '🔧',
  social: '🌐',
  leveling: '📈',
  giveaway: '🎁',
  image: '🖼️',
  starboard: '⭐',
  applications: '📝',
  premium: '💎',
  owner: '🔑',
  bronze: '🥉',
  silver: '⭐',
  gold: '💎',
  diamond: '👑',
};

export const COLORS = {
  default: 0x5865f2,
  success: 0x57f287,
  error: 0xed4245,
  warning: 0xfee75c,
  info: 0x5865f2,
  bronze: 0xcd7f32,
  silver: 0xc0c0c0,
  gold: 0xffd700,
  diamond: 0xb9f2ff,
};

export const PERMISSIONS = {
  MODERATOR: [
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ViewAuditLog,
  ],
  ADMINISTRATOR: [
    PermissionFlagsBits.Administrator,
  ],
  MUSIC: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.UseVAD,
  ],
};

export const COOLDOWN_SECONDS = {
  default: 3,
  music: 2,
  economy: 5,
  ai: 10,
  games: 5,
  moderation: 3,
  owner: 0,
};

export const PREMIUM_TIERS = {
  free: 'free',
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  diamond: 'diamond',
} as const;

export const COMMAND_CATEGORIES = {
  help: 'help',
  moderation: 'moderation',
  admin: 'admin',
  music: 'music',
  economy: 'economy',
  games: 'games',
  fun: 'fun',
  ai: 'ai',
  info: 'info',
  utility: 'utility',
  social: 'social',
  leveling: 'leveling',
  giveaway: 'giveaway',
  image: 'image',
  starboard: 'starboard',
  applications: 'applications',
  premium: 'premium',
  owner: 'owner',
} as const;

export const LEVEL_XP_REQUIREMENTS = [
  0,      // Level 0
  100,    // Level 1
  250,    // Level 2
  450,    // Level 3
  700,    // Level 4
  1000,   // Level 5
  1400,   // Level 6
  1900,   // Level 7
  2500,   // Level 8
  3200,   // Level 9
  4000,   // Level 10
  5000,   // Level 11
  6200,   // Level 12
  7600,   // Level 13
  9200,   // Level 14
  11000,  // Level 15
  13000,  // Level 16
  15400,  // Level 17
  18100,  // Level 18
  21200,  // Level 19
  24700,  // Level 20
  28600,  // Level 21
  32900,  // Level 22
  37600,  // Level 23
  42700,  // Level 24
  48200,  // Level 25
  54100,  // Level 26
  60400,  // Level 27
  67100,  // Level 28
  74200,  // Level 29
  81700,  // Level 30
  89600,  // Level 31
  97900,  // Level 32
  106600, // Level 33
  115700, // Level 34
  125200, // Level 35
  135100, // Level 36
  145400, // Level 37
  156100, // Level 38
  167200, // Level 39
  178700, // Level 40
  190600, // Level 41
  202900, // Level 42
  215600, // Level 43
  228700, // Level 44
  242200, // Level 45
  256100, // Level 46
  270400, // Level 47
  285100, // Level 48
  300200, // Level 49
  315700, // Level 50
];

export const ECONOMY_ITEMS = {
  fishing_rod: { name: 'Fishing Rod', price: 500, emoji: '🎣' },
  hunting_rifle: { name: 'Hunting Rifle', price: 800, emoji: '🔫' },
  mining_pickaxe: { name: 'Mining Pickaxe', price: 600, emoji: '⛏️' },
  farming_hoe: { name: 'Farming Hoe', price: 400, emoji: '🌾' },
  laptop: { name: 'Laptop', price: 2000, emoji: '💻' },
  smartphone: { name: 'Smartphone', price: 1500, emoji: '📱' },
  car: { name: 'Car', price: 50000, emoji: '🚗' },
  house: { name: 'House', price: 200000, emoji: '🏠' },
  yacht: { name: 'Yacht', price: 1000000, emoji: '🛥️' },
  private_jet: { name: 'Private Jet', price: 5000000, emoji: '✈️' },
};

export const GAME_EMOJIS = {
  tictactoe: { x: '❌', o: '⭕' },
  battleship: { hit: '💥', miss: '💧', ship: '🚢' },
  chess: { pawn: '♟️', rook: '♜', knight: '♞', bishop: '♝', queen: '♛', king: '♚' },
  cards: { spade: '♠️', heart: '♥️', diamond: '♦️', club: '♣️' },
  dice: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
};

export const ANIMAL_EMOJIS = {
  cat: ['🐱', '🐈', '😺', '😸', '😻'],
  dog: ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'],
  fox: ['🦊'],
  panda: ['🐼', '🐻'],
  duck: ['🦆'],
  capybara: ['🦫'],
  shiba: ['🐕', '🐶'],
  otter: ['🦦'],
  bunny: ['🐰', '🐇'],
  koala: ['🐨'],
  bird: ['🐦', '🐧', '🦜', '🦉', '🦅'],
};

export const FUN_RESPONSES = {
  '8ball': [
    'Yes, definitely.',
    'It is certain.',
    'Without a doubt.',
    'Yes, absolutely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    "Don't count on it.",
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.',
  ],
  coinflip: ['Heads', 'Tails'],
  dice: (sides: number) => Math.floor(Math.random() * sides) + 1,
};

export const AI_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3', 'o4-mini'],
  anthropic: ['claude-4-opus', 'claude-4-sonnet', 'claude-3.5-haiku'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  groq: ['llama-3.3-70b', 'mixtral', 'gemma-2'],
};

export const MUSIC_SOURCES = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  apple_music: 'Apple Music',
  deezer: 'Deezer',
  tidal: 'Tidal',
};

export const MAX_VALUES = {
  queue: {
    default: 200,
    gold: 1000,
    diamond: -1,
  },
  song_duration: 18000,
  purge: 1000,
  description: 4096,
  embed_fields: 25,
  embed_title: 256,
  embed_field_name: 256,
  embed_field_value: 1024,
  embed_footer: 2048,
  embed_author: 256,
};
