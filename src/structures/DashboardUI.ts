/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Dashboard UI
 *  Mini-dashboard style command organization
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

// ─── Dashboard Section Interface ─────────────────────────────────────────────────
export interface DashboardSection {
  title: string;
  fields: { name: string; value: string; inline?: boolean }[];
  emoji?: string;
}

// ─── Dashboard Options Interface ───────────────────────────────────────────────
export interface DashboardOptions {
  title?: string;
  description?: string;
  thumbnail?: string;
  image?: string;
  color?: number;
  footer?: string;
  showTimestamp?: boolean;
}

// ─── Create Dashboard Embed ───────────────────────────────────────────────────────
export function createDashboardEmbed(
  sections: DashboardSection[],
  options: DashboardOptions = {}
): EmbedBuilder {
  const {
    title = 'Dashboard',
    description,
    thumbnail,
    image,
    color,
    footer,
    showTimestamp = true,
  } = options;

  const embed = EmbedManager.dashboard(title, description);

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);
  if (color) embed.setColor(color);
  if (footer) embed.setFooter({ text: footer });
  if (!showTimestamp) embed.setTimestamp(null);

  // Add sections with proper spacing
  for (const section of sections) {
    const sectionTitle = section.emoji ? `${section.emoji} ${section.title}` : section.title;
    embed.addFields(
      { name: sectionTitle, value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
      ...section.fields
    );
  }

  return embed;
}

// ─── Server Stats Dashboard ─────────────────────────────────────────────────────
export function createServerStatsDashboard(
  guildName: string,
  stats: {
    members: number;
    channels: number;
    roles: number;
    online: number;
    bots: number;
    region: string;
    createdAt: string;
    ownerId: string;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'Server Overview',
      emoji: '🏠',
      fields: [
        { name: '👥 Members', value: stats.members.toLocaleString(), inline: true },
        { name: '📺 Channels', value: stats.channels.toLocaleString(), inline: true },
        { name: '🎭 Roles', value: stats.roles.toLocaleString(), inline: true },
        { name: '🟢 Online', value: stats.online.toLocaleString(), inline: true },
        { name: '🤖 Bots', value: stats.bots.toLocaleString(), inline: true },
        { name: '🌍 Region', value: stats.region, inline: true },
      ],
    },
    {
      title: 'Server Information',
      emoji: 'ℹ️',
      fields: [
        { name: '📅 Created', value: stats.createdAt, inline: true },
        { name: '👑 Owner', value: `<@${stats.ownerId}>`, inline: true },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Server Statistics - ${guildName}`,
    footer: guildName,
  });
}

// ─── User Profile Dashboard ───────────────────────────────────────────────────────
export function createUserProfileDashboard(
  username: string,
  profile: {
    avatar?: string;
    joinedAt: string;
    createdAt: string;
    roles: string[];
    permissions: string[];
    level?: number;
    xp?: number;
    balance?: number;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'User Information',
      emoji: '👤',
      fields: [
        { name: '📅 Account Created', value: profile.createdAt, inline: true },
        { name: '🎉 Joined Server', value: profile.joinedAt, inline: true },
      ],
    },
    {
      title: 'Roles',
      emoji: '🎭',
      fields: [
        { name: 'Assigned Roles', value: profile.roles.slice(0, 10).join(', ') || 'None', inline: false },
      ],
    },
  ];

  if (profile.level !== undefined && profile.xp !== undefined) {
    sections.push({
      title: 'Leveling',
      emoji: '📈',
      fields: [
        { name: '🎯 Level', value: profile.level.toString(), inline: true },
        { name: '⭐ XP', value: profile.xp.toLocaleString(), inline: true },
      ],
    });
  }

  if (profile.balance !== undefined) {
    sections.push({
      title: 'Economy',
      emoji: '💰',
      fields: [
        { name: '💵 Balance', value: `₱${profile.balance.toLocaleString()}`, inline: true },
      ],
    });
  }

  return createDashboardEmbed(sections, {
    title: `User Profile - ${username}`,
    thumbnail: profile.avatar,
  });
}

// ─── Bot Statistics Dashboard ────────────────────────────────────────────────────
export function createBotStatsDashboard(
  botName: string,
  stats: {
    servers: number;
    users: number;
    channels: number;
    uptime: string;
    ping: number;
    memory: string;
    version: string;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'Bot Overview',
      emoji: '🤖',
      fields: [
        { name: '🏠 Servers', value: stats.servers.toLocaleString(), inline: true },
        { name: '👥 Users', value: stats.users.toLocaleString(), inline: true },
        { name: '📺 Channels', value: stats.channels.toLocaleString(), inline: true },
      ],
    },
    {
      title: 'Performance',
      emoji: '📊',
      fields: [
        { name: '⏱️ Uptime', value: stats.uptime, inline: true },
        { name: '📶 Ping', value: `${stats.ping}ms`, inline: true },
        { name: '💾 Memory', value: stats.memory, inline: true },
      ],
    },
    {
      title: 'System Information',
      emoji: '⚙️',
      fields: [
        { name: '📦 Version', value: stats.version, inline: true },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Bot Statistics - ${botName}`,
  });
}

// ─── Economy Dashboard ───────────────────────────────────────────────────────────
export function createEconomyDashboard(
  username: string,
  economy: {
    balance: number;
    bank: number;
    inventory: { name: string; value: number }[];
    dailyStreak: number;
    lastDaily: string;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'Wallet',
      emoji: '💰',
      fields: [
        { name: '💵 Cash', value: `₱${economy.balance.toLocaleString()}`, inline: true },
        { name: '🏦 Bank', value: `₱${economy.bank.toLocaleString()}`, inline: true },
        { name: '💎 Total', value: `₱${(economy.balance + economy.bank).toLocaleString()}`, inline: true },
      ],
    },
    {
      title: 'Daily Rewards',
      emoji: '🎁',
      fields: [
        { name: '🔥 Streak', value: `${economy.dailyStreak} days`, inline: true },
        { name: '⏰ Last Claimed', value: economy.lastDaily, inline: true },
      ],
    },
    {
      title: 'Inventory',
      emoji: '🎒',
      fields: [
        {
          name: 'Items',
          value: economy.inventory.slice(0, 5).map(i => `${i.name} (₱${i.value})`).join('\n') || 'No items',
          inline: false,
        },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Economy Dashboard - ${username}`,
  });
}

// ─── Moderation Dashboard ───────────────────────────────────────────────────────
export function createModerationDashboard(
  guildName: string,
  stats: {
    cases: number;
    warnings: number;
    mutes: number;
    kicks: number;
    bans: number;
    activeMutes: number;
    activeBans: number;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'Moderation Overview',
      emoji: '🛡️',
      fields: [
        { name: '📋 Total Cases', value: stats.cases.toString(), inline: true },
        { name: '⚠️ Warnings', value: stats.warnings.toString(), inline: true },
        { name: '🔇 Mutes', value: stats.mutes.toString(), inline: true },
        { name: '👢 Kicks', value: stats.kicks.toString(), inline: true },
        { name: '🔨 Bans', value: stats.bans.toString(), inline: true },
      ],
    },
    {
      title: 'Active Actions',
      emoji: '⚡',
      fields: [
        { name: '🔇 Active Mutes', value: stats.activeMutes.toString(), inline: true },
        { name: '🔨 Active Bans', value: stats.activeBans.toString(), inline: true },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Moderation Dashboard - ${guildName}`,
  });
}

// ─── Leveling Dashboard ───────────────────────────────────────────────────────────
export function createLevelingDashboard(
  username: string,
  leveling: {
    level: number;
    xp: number;
    xpToNext: number;
    rank: number;
    messages: number;
    voiceMinutes: number;
  }
): EmbedBuilder {
  const progress = Math.round((leveling.xp / leveling.xpToNext) * 100);
  const progressBar = '▬'.repeat(Math.floor(progress / 10)) + '🔘' + '▬'.repeat(10 - Math.floor(progress / 10));

  const sections: DashboardSection[] = [
    {
      title: 'Level Progress',
      emoji: '📈',
      fields: [
        { name: '🎯 Level', value: leveling.level.toString(), inline: true },
        { name: '⭐ XP', value: `${leveling.xp.toLocaleString()} / ${leveling.xpToNext.toLocaleString()}`, inline: true },
        { name: '📊 Progress', value: `${progressBar} ${progress}%`, inline: false },
      ],
    },
    {
      title: 'Statistics',
      emoji: '📊',
      fields: [
        { name: '🏆 Server Rank', value: `#${leveling.rank}`, inline: true },
        { name: '💬 Messages', value: leveling.messages.toLocaleString(), inline: true },
        { name: '🎤 Voice Minutes', value: leveling.voiceMinutes.toLocaleString(), inline: true },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Leveling Dashboard - ${username}`,
  });
}

// ─── Settings Dashboard ─────────────────────────────────────────────────────────
export function createSettingsDashboard(
  guildName: string,
  settings: {
    prefix: string;
    language: string;
    timezone: string;
    welcomeChannel?: string;
    goodbyeChannel?: string;
    logChannel?: string;
    musicChannel?: string;
    levelUpChannel?: string;
  }
): EmbedBuilder {
  const sections: DashboardSection[] = [
    {
      title: 'General Settings',
      emoji: '⚙️',
      fields: [
        { name: '🔤 Prefix', value: settings.prefix, inline: true },
        { name: '🌍 Language', value: settings.language, inline: true },
        { name: '🕐 Timezone', value: settings.timezone, inline: true },
      ],
    },
    {
      title: 'Channel Configuration',
      emoji: '📺',
      fields: [
        { name: '👋 Welcome', value: settings.welcomeChannel || 'Not set', inline: true },
        { name: '👋 Goodbye', value: settings.goodbyeChannel || 'Not set', inline: true },
        { name: '📋 Logs', value: settings.logChannel || 'Not set', inline: true },
        { name: '🎵 Music', value: settings.musicChannel || 'Not set', inline: true },
        { name: '📈 Level Up', value: settings.levelUpChannel || 'Not set', inline: true },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Server Settings - ${guildName}`,
  });
}

// ─── Premium Dashboard ───────────────────────────────────────────────────────────
export function createPremiumDashboard(
  username: string,
  premium: {
    tier: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
    expiresAt?: string;
    features: string[];
    servers: number;
  }
): EmbedBuilder {
  const tierEmojis: Record<string, string> = {
    free: '🆓',
    bronze: '🥉',
    silver: '⭐',
    gold: '💎',
    diamond: '👑',
  };

  const sections: DashboardSection[] = [
    {
      title: 'Premium Status',
      emoji: '💎',
      fields: [
        { name: '🏆 Tier', value: `${tierEmojis[premium.tier]} ${premium.tier.charAt(0).toUpperCase() + premium.tier.slice(1)}`, inline: true },
        { name: '🏠 Servers', value: premium.servers.toString(), inline: true },
        ...(premium.expiresAt ? [{ name: '⏰ Expires', value: premium.expiresAt, inline: true }] : []),
      ],
    },
    {
      title: 'Active Features',
      emoji: '✨',
      fields: [
        { name: 'Features', value: premium.features.map(f => `• ${f}`).join('\n'), inline: false },
      ],
    },
  ];

  return createDashboardEmbed(sections, {
    title: `Premium Dashboard - ${username}`,
  });
}

// ─── Dashboard Components ───────────────────────────────────────────────────────
export function createDashboardComponents(
  prefix: string,
  options: {
    showSettings?: boolean;
    showStatistics?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
  } = {}
): ActionRowBuilder<ButtonBuilder>[] {
  return [ButtonManager.dashboard(prefix, options)];
}

// ─── Send Dashboard Response ─────────────────────────────────────────────────────
export async function sendDashboard(
  source: ChatInputCommandInteraction | Message,
  sections: DashboardSection[],
  options: DashboardOptions & {
    prefix?: string;
    showSettings?: boolean;
    showStatistics?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
  } = {}
): Promise<Message | null> {
  const {
    prefix = 'dashboard',
    showSettings = true,
    showStatistics = true,
    showRefresh = true,
    showClose = true,
    ...dashboardOptions
  } = options;

  const embed = createDashboardEmbed(sections, dashboardOptions);
  const components = createDashboardComponents(prefix, {
    showSettings,
    showStatistics,
    showRefresh,
    showClose,
  });

  if (source instanceof Message) {
    return await source.reply({ embeds: [embed], components });
  } else {
    await source.reply({ embeds: [embed], components });
    return await source.fetchReply() as Message;
  }
}

// ─── Export Dashboard UI ─────────────────────────────────────────────────────────
export const DashboardUI = {
  create: createDashboardEmbed,
  createServerStats: createServerStatsDashboard,
  createUserProfile: createUserProfileDashboard,
  createBotStats: createBotStatsDashboard,
  createEconomy: createEconomyDashboard,
  createModeration: createModerationDashboard,
  createLeveling: createLevelingDashboard,
  createSettings: createSettingsDashboard,
  createPremium: createPremiumDashboard,
  createComponents: createDashboardComponents,
  send: sendDashboard,
} as const;
