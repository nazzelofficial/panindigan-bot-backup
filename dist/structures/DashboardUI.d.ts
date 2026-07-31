/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Dashboard UI
 *  Mini-dashboard style command organization
 * ═══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
export interface DashboardSection {
    title: string;
    fields: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
    emoji?: string;
}
export interface DashboardOptions {
    title?: string;
    description?: string;
    thumbnail?: string;
    image?: string;
    color?: number;
    footer?: string;
    showTimestamp?: boolean;
}
export declare function createDashboardEmbed(sections: DashboardSection[], options?: DashboardOptions): EmbedBuilder;
export declare function createServerStatsDashboard(guildName: string, stats: {
    members: number;
    channels: number;
    roles: number;
    online: number;
    bots: number;
    region: string;
    createdAt: string;
    ownerId: string;
}): EmbedBuilder;
export declare function createUserProfileDashboard(username: string, profile: {
    avatar?: string;
    joinedAt: string;
    createdAt: string;
    roles: string[];
    permissions: string[];
    level?: number;
    xp?: number;
    balance?: number;
}): EmbedBuilder;
export declare function createBotStatsDashboard(botName: string, stats: {
    servers: number;
    users: number;
    channels: number;
    uptime: string;
    ping: number;
    memory: string;
    version: string;
}): EmbedBuilder;
export declare function createEconomyDashboard(username: string, economy: {
    balance: number;
    bank: number;
    inventory: {
        name: string;
        value: number;
    }[];
    dailyStreak: number;
    lastDaily: string;
}): EmbedBuilder;
export declare function createModerationDashboard(guildName: string, stats: {
    cases: number;
    warnings: number;
    mutes: number;
    kicks: number;
    bans: number;
    activeMutes: number;
    activeBans: number;
}): EmbedBuilder;
export declare function createLevelingDashboard(username: string, leveling: {
    level: number;
    xp: number;
    xpToNext: number;
    rank: number;
    messages: number;
    voiceMinutes: number;
}): EmbedBuilder;
export declare function createSettingsDashboard(guildName: string, settings: {
    prefix: string;
    language: string;
    timezone: string;
    welcomeChannel?: string;
    goodbyeChannel?: string;
    logChannel?: string;
    musicChannel?: string;
    levelUpChannel?: string;
}): EmbedBuilder;
export declare function createPremiumDashboard(username: string, premium: {
    tier: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
    expiresAt?: string;
    features: string[];
    servers: number;
}): EmbedBuilder;
export declare function createDashboardComponents(prefix: string, options?: {
    showSettings?: boolean;
    showStatistics?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
}): ActionRowBuilder<ButtonBuilder>[];
export declare function sendDashboard(source: ChatInputCommandInteraction | Message, sections: DashboardSection[], options?: DashboardOptions & {
    prefix?: string;
    showSettings?: boolean;
    showStatistics?: boolean;
    showRefresh?: boolean;
    showClose?: boolean;
}): Promise<Message | null>;
export declare const DashboardUI: {
    readonly create: typeof createDashboardEmbed;
    readonly createServerStats: typeof createServerStatsDashboard;
    readonly createUserProfile: typeof createUserProfileDashboard;
    readonly createBotStats: typeof createBotStatsDashboard;
    readonly createEconomy: typeof createEconomyDashboard;
    readonly createModeration: typeof createModerationDashboard;
    readonly createLeveling: typeof createLevelingDashboard;
    readonly createSettings: typeof createSettingsDashboard;
    readonly createPremium: typeof createPremiumDashboard;
    readonly createComponents: typeof createDashboardComponents;
    readonly send: typeof sendDashboard;
};
//# sourceMappingURL=DashboardUI.d.ts.map