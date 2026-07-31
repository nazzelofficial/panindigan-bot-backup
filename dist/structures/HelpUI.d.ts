/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Help UI
 *  Modern help system with dashboard and search
 * ═══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
export interface CommandInfo {
    name: string;
    description: string;
    category: string;
    aliases?: string[];
    usage?: string;
    examples?: string[];
    permissions?: string[];
    cooldown?: number;
    related?: string[];
    premium?: boolean;
    nsfw?: boolean;
    devOnly?: boolean;
}
export interface CategoryInfo {
    name: string;
    emoji: string;
    description: string;
    commands: string[];
}
export declare class HelpUI {
    private static categories;
    /**
     * Create main help dashboard embed
     */
    static createDashboardEmbed(botName: string, commandCount: number): EmbedBuilder;
    /**
     * Create category embed with commands
     */
    static createCategoryEmbed(category: CategoryInfo, commands: CommandInfo[]): EmbedBuilder;
    /**
     * Create command detail embed
     */
    static createCommandEmbed(command: CommandInfo): EmbedBuilder;
    /**
     * Create search results embed
     */
    static createSearchEmbed(query: string, results: CommandInfo[]): EmbedBuilder;
    /**
     * Create favorites embed
     */
    static createFavoritesEmbed(favorites: CommandInfo[]): EmbedBuilder;
    /**
     * Create recently used embed
     */
    static createRecentEmbed(recent: CommandInfo[]): EmbedBuilder;
    /**
     * Create help dashboard components
     */
    static createDashboardComponents(prefix: string): ActionRowBuilder<ButtonBuilder>[];
    /**
     * Create category select menu
     */
    static createCategorySelect(prefix: string): ActionRowBuilder<StringSelectMenuBuilder>;
    /**
     * Send help dashboard
     */
    static sendDashboard(source: ChatInputCommandInteraction | Message, botName: string, commandCount: number, prefix?: string): Promise<Message | null>;
    /**
     * Send category view
     */
    static sendCategory(source: ChatInputCommandInteraction | Message, category: CategoryInfo, commands: CommandInfo[], prefix?: string): Promise<Message | null>;
    /**
     * Send command detail view
     */
    static sendCommand(source: ChatInputCommandInteraction | Message, command: CommandInfo, prefix?: string): Promise<Message | null>;
    /**
     * Search commands
     */
    static searchCommands(query: string, commands: CommandInfo[]): CommandInfo[];
    /**
     * Get commands by category
     */
    static getCommandsByCategory(category: string, commands: CommandInfo[]): CommandInfo[];
    /**
     * Format permissions for display
     */
    static formatPermissions(permissions: string[]): string;
}
export default HelpUI;
//# sourceMappingURL=HelpUI.d.ts.map