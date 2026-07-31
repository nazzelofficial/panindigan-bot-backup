// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Select Menu Manager
 *  Professional select menu system with improved UX
 * ═══════════════════════════════════════════════════
 */

import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuInteraction,
  RoleSelectMenuBuilder,
  UserSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  ChannelType,
} from 'discord.js';

// ─── Select Menu Option Interface ─────────────────────────────────────────────────
export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

// ─── String Select Menu Builder ────────────────────────────────────────────────────
export function stringSelectMenu(
  customId: string,
  placeholder: string,
  options: SelectMenuOption[],
  config: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
  } = {}
): ActionRowBuilder<StringSelectMenuBuilder> {
  const { minValues = 1, maxValues = 1, disabled = false } = config;

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled)
    .addOptions(
      options.map(opt => {
        const option = new StringSelectMenuOptionBuilder()
          .setLabel(opt.label)
          .setValue(opt.value);

        if (opt.description) option.setDescription(opt.description);
        if (opt.emoji) option.setEmoji(opt.emoji);
        if (opt.default) option.setDefault(opt.default);

        return option;
      })
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

// ─── Role Select Menu Builder ─────────────────────────────────────────────────────
export function roleSelectMenu(
  customId: string,
  placeholder: string,
  config: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultRoles?: string[];
  } = {}
): ActionRowBuilder<RoleSelectMenuBuilder> {
  const { minValues = 1, maxValues = 1, disabled = false, defaultRoles = [] } = config;

  const menu = new RoleSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);

  if (defaultRoles.length > 0) {
    menu.setDefaultRoles(defaultRoles);
  }

  return new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(menu);
}

// ─── User Select Menu Builder ─────────────────────────────────────────────────────
export function userSelectMenu(
  customId: string,
  placeholder: string,
  config: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultUsers?: string[];
  } = {}
): ActionRowBuilder<UserSelectMenuBuilder> {
  const { minValues = 1, maxValues = 1, disabled = false, defaultUsers = [] } = config;

  const menu = new UserSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);

  if (defaultUsers.length > 0) {
    menu.setDefaultUsers(defaultUsers);
  }

  return new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu);
}

// ─── Channel Select Menu Builder ─────────────────────────────────────────────────
export function channelSelectMenu(
  customId: string,
  placeholder: string,
  config: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    channelTypes?: ChannelType[];
    defaultChannels?: string[];
  } = {}
): ActionRowBuilder<ChannelSelectMenuBuilder> {
  const {
    minValues = 1,
    maxValues = 1,
    disabled = false,
    channelTypes = [],
    defaultChannels = [],
  } = config;

  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);

  if (channelTypes.length > 0) {
    menu.setChannelTypes(channelTypes);
  }

  if (defaultChannels.length > 0) {
    menu.setDefaultChannels(defaultChannels);
  }

  return new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu);
}

// ─── Mentionable Select Menu Builder ───────────────────────────────────────────────
export function mentionableSelectMenu(
  customId: string,
  placeholder: string,
  config: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
    defaultUsers?: string[];
    defaultRoles?: string[];
  } = {}
): ActionRowBuilder<MentionableSelectMenuBuilder> {
  const {
    minValues = 1,
    maxValues = 1,
    disabled = false,
    defaultUsers = [],
    defaultRoles = [],
  } = config;

  const menu = new MentionableSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .setDisabled(disabled);

  if (defaultUsers.length > 0) {
    menu.setDefaultUsers(defaultUsers);
  }

  if (defaultRoles.length > 0) {
    menu.setDefaultRoles(defaultRoles);
  }

  return new ActionRowBuilder<MentionableSelectMenuBuilder>().addComponents(menu);
}

// ─── Category Select Menu (for command categories) ───────────────────────────────
export function categorySelectMenu(
  customId: string,
  categories: { name: string; value: string; emoji: string; description: string }[]
): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select a category',
    categories.map(cat => ({
      label: cat.name,
      value: cat.value,
      description: cat.description,
      emoji: cat.emoji,
    })),
    { maxValues: 1 }
  );
}

// ─── Music Source Select Menu ────────────────────────────────────────────────────
export function musicSourceSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select music source',
    [
      { label: 'YouTube', value: 'youtube', description: 'Search YouTube for music', emoji: '🎬' },
      { label: 'Spotify', value: 'spotify', description: 'Search Spotify for music', emoji: '🎵' },
      { label: 'SoundCloud', value: 'soundcloud', description: 'Search SoundCloud for music', emoji: '☁️' },
      { label: 'Apple Music', value: 'apple_music', description: 'Search Apple Music for music', emoji: '🍎' },
      { label: 'Deezer', value: 'deezer', description: 'Search Deezer for music', emoji: '🎧' },
    ],
    { maxValues: 1 }
  );
}

// ─── Language Select Menu ─────────────────────────────────────────────────────────
export function languageSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select language',
    [
      { label: 'English', value: 'en', description: 'English', emoji: '🇬🇧' },
      { label: 'Spanish', value: 'es', description: 'Español', emoji: '🇪🇸' },
      { label: 'French', value: 'fr', description: 'Français', emoji: '🇫🇷' },
      { label: 'German', value: 'de', description: 'Deutsch', emoji: '🇩🇪' },
      { label: 'Italian', value: 'it', description: 'Italiano', emoji: '🇮🇹' },
      { label: 'Portuguese', value: 'pt', description: 'Português', emoji: '🇵🇹' },
      { label: 'Russian', value: 'ru', description: 'Русский', emoji: '🇷🇺' },
      { label: 'Japanese', value: 'ja', description: '日本語', emoji: '🇯🇵' },
      { label: 'Korean', value: 'ko', description: '한국어', emoji: '🇰🇷' },
      { label: 'Chinese', value: 'zh', description: '中文', emoji: '🇨🇳' },
      { label: 'Filipino', value: 'fil', description: 'Filipino', emoji: '🇵🇭' },
    ],
    { maxValues: 1 }
  );
}

// ─── Premium Tier Select Menu ────────────────────────────────────────────────────
export function premiumTierSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select premium tier',
    [
      { label: 'Free', value: 'free', description: 'Basic features', emoji: '🆓' },
      { label: 'Bronze', value: 'bronze', description: 'Bronze tier benefits', emoji: '🥉' },
      { label: 'Silver', value: 'silver', description: 'Silver tier benefits', emoji: '⭐' },
      { label: 'Gold', value: 'gold', description: 'Gold tier benefits', emoji: '💎' },
      { label: 'Diamond', value: 'diamond', description: 'Diamond tier benefits', emoji: '👑' },
    ],
    { maxValues: 1 }
  );
}

// ─── Timezone Select Menu ────────────────────────────────────────────────────────
export function timezoneSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select timezone',
    [
      { label: 'UTC', value: 'UTC', description: 'Coordinated Universal Time', emoji: '🌍' },
      { label: 'America/New_York', value: 'America/New_York', description: 'Eastern Time', emoji: '🇺🇸' },
      { label: 'America/Los_Angeles', value: 'America/Los_Angeles', description: 'Pacific Time', emoji: '🇺🇸' },
      { label: 'America/Chicago', value: 'America/Chicago', description: 'Central Time', emoji: '🇺🇸' },
      { label: 'Europe/London', value: 'Europe/London', description: 'Greenwich Mean Time', emoji: '🇬🇧' },
      { label: 'Europe/Paris', value: 'Europe/Paris', description: 'Central European Time', emoji: '🇫🇷' },
      { label: 'Asia/Tokyo', value: 'Asia/Tokyo', description: 'Japan Standard Time', emoji: '🇯🇵' },
      { label: 'Asia/Manila', value: 'Asia/Manila', description: 'Philippine Time', emoji: '🇵🇭' },
      { label: 'Australia/Sydney', value: 'Australia/Sydney', description: 'Australian Eastern Time', emoji: '🇦🇺' },
    ],
    { maxValues: 1 }
  );
}

// ─── Queue Action Select Menu ─────────────────────────────────────────────────────
export function queueActionSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select queue action',
    [
      { label: 'Remove Song', value: 'remove', description: 'Remove a song from the queue', emoji: '🗑️' },
      { label: 'Move Song', value: 'move', description: 'Move a song to a different position', emoji: '🔄' },
      { label: 'Clear Queue', value: 'clear', description: 'Clear the entire queue', emoji: '🧹' },
      { label: 'Shuffle Queue', value: 'shuffle', description: 'Shuffle the queue', emoji: '🔀' },
      { label: 'Save Queue', value: 'save', description: 'Save the current queue as a playlist', emoji: '💾' },
    ],
    { maxValues: 1 }
  );
}

// ─── Moderation Action Select Menu ─────────────────────────────────────────────────
export function moderationActionSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select moderation action',
    [
      { label: 'Warn', value: 'warn', description: 'Warn the user', emoji: '⚠️' },
      { label: 'Timeout', value: 'timeout', description: 'Timeout the user', emoji: '⏰' },
      { label: 'Kick', value: 'kick', description: 'Kick the user', emoji: '👢' },
      { label: 'Ban', value: 'ban', description: 'Ban the user', emoji: '🔨' },
      { label: 'Soft Ban', value: 'softban', description: 'Soft ban the user', emoji: '⚡' },
      { label: 'Mute', value: 'mute', description: 'Mute the user', emoji: '🔇' },
    ],
    { maxValues: 1 }
  );
}

// ─── AI Model Select Menu ─────────────────────────────────────────────────────────
export function aiModelSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select AI model',
    [
      { label: 'GPT-4o', value: 'gpt-4o', description: 'OpenAI GPT-4o', emoji: '🤖' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini', description: 'OpenAI GPT-4o Mini', emoji: '⚡' },
      { label: 'Claude 4 Opus', value: 'claude-4-opus', description: 'Anthropic Claude 4 Opus', emoji: '🧠' },
      { label: 'Claude 4 Sonnet', value: 'claude-4-sonnet', description: 'Anthropic Claude 4 Sonnet', emoji: '✨' },
      { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro', description: 'Google Gemini 2.5 Pro', emoji: '💡' },
      { label: 'Llama 3.3', value: 'llama-3.3-70b', description: 'Meta Llama 3.3', emoji: '🦙' },
    ],
    { maxValues: 1 }
  );
}

// ─── Help Category Select Menu ────────────────────────────────────────────────────
export function helpCategorySelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select a category',
    [
      { label: '🎵 Music', value: 'music', description: 'Music commands', emoji: '🎵' },
      { label: '🛡️ Moderation', value: 'moderation', description: 'Moderation commands', emoji: '🛡️' },
      { label: '💰 Economy', value: 'economy', description: 'Economy commands', emoji: '💰' },
      { label: '🎮 Games', value: 'games', description: 'Game commands', emoji: '🎮' },
      { label: '🎉 Fun', value: 'fun', description: 'Fun commands', emoji: '🎉' },
      { label: '🤖 AI', value: 'ai', description: 'AI commands', emoji: '🤖' },
      { label: '🔧 Utility', value: 'utility', description: 'Utility commands', emoji: '🔧' },
      { label: '📈 Leveling', value: 'leveling', description: 'Leveling commands', emoji: '📈' },
      { label: '🎁 Giveaway', value: 'giveaway', description: 'Giveaway commands', emoji: '🎁' },
      { label: '💎 Premium', value: 'premium', description: 'Premium commands', emoji: '💎' },
      { label: '🌐 Social', value: 'social', description: 'Social commands', emoji: '🌐' },
      { label: '👑 Admin', value: 'admin', description: 'Admin commands', emoji: '👑' },
    ],
    { maxValues: 1 }
  );
}

// ─── Sort Order Select Menu ─────────────────────────────────────────────────────
export function sortOrderSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select sort order',
    [
      { label: 'Ascending (A-Z)', value: 'asc', description: 'Sort in ascending order', emoji: '🔺' },
      { label: 'Descending (Z-A)', value: 'desc', description: 'Sort in descending order', emoji: '🔻' },
      { label: 'Newest First', value: 'newest', description: 'Sort by newest', emoji: '🆕' },
      { label: 'Oldest First', value: 'oldest', description: 'Sort by oldest', emoji: '📅' },
    ],
    { maxValues: 1 }
  );
}

// ─── Pagination Size Select Menu ───────────────────────────────────────────────────
export function paginationSizeSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select items per page',
    [
      { label: '5 items', value: '5', description: 'Show 5 items per page', emoji: '5️⃣' },
      { label: '10 items', value: '10', description: 'Show 10 items per page', emoji: '🔟' },
      { label: '15 items', value: '15', description: 'Show 15 items per page', emoji: '1️⃣5️⃣' },
      { label: '20 items', value: '20', description: 'Show 20 items per page', emoji: '2️⃣0️⃣' },
    ],
    { maxValues: 1 }
  );
}

// ─── Export Select Menu ─────────────────────────────────────────────────────────────
export function exportSelectMenu(customId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(
    customId,
    'Select export format',
    [
      { label: 'JSON', value: 'json', description: 'Export as JSON', emoji: '📄' },
      { label: 'CSV', value: 'csv', description: 'Export as CSV', emoji: '📊' },
      { label: 'TXT', value: 'txt', description: 'Export as plain text', emoji: '📝' },
    ],
    { maxValues: 1 }
  );
}

// ─── Custom Select Menu Builder ───────────────────────────────────────────────────
export function customSelectMenu(
  customId: string,
  placeholder: string,
  options: SelectMenuOption[],
  config?: {
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
  }
): ActionRowBuilder<StringSelectMenuBuilder> {
  return stringSelectMenu(customId, placeholder, options, config);
}

// ─── Helper to get selected values from interaction ─────────────────────────────────
export function getSelectedValues(interaction: StringSelectMenuInteraction): string[] {
  return interaction.values;
}

// ─── Export Select Menu Manager ────────────────────────────────────────────────────
export const SelectMenuManager = {
  string: stringSelectMenu,
  role: roleSelectMenu,
  user: userSelectMenu,
  channel: channelSelectMenu,
  mentionable: mentionableSelectMenu,
  category: categorySelectMenu,
  musicSource: musicSourceSelectMenu,
  language: languageSelectMenu,
  premiumTier: premiumTierSelectMenu,
  timezone: timezoneSelectMenu,
  queueAction: queueActionSelectMenu,
  moderationAction: moderationActionSelectMenu,
  aiModel: aiModelSelectMenu,
  helpCategory: helpCategorySelectMenu,
  sortOrder: sortOrderSelectMenu,
  paginationSize: paginationSizeSelectMenu,
  export: exportSelectMenu,
  custom: customSelectMenu,
  getSelectedValues,
} as const;
