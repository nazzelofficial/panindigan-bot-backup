import { Client } from 'discord.js';
export interface EmojiConfig {
    id?: string;
    name: string;
    animated?: boolean;
    fallback: string;
}
export interface CategoryEmojis {
    admin: Record<string, EmojiConfig>;
    ai: Record<string, EmojiConfig>;
    applications: Record<string, EmojiConfig>;
    context: Record<string, EmojiConfig>;
    economy: Record<string, EmojiConfig>;
    fun: Record<string, EmojiConfig>;
    games: Record<string, EmojiConfig>;
    giveaway: Record<string, EmojiConfig>;
    help: Record<string, EmojiConfig>;
    image: Record<string, EmojiConfig>;
    info: Record<string, EmojiConfig>;
    leveling: Record<string, EmojiConfig>;
    moderation: Record<string, EmojiConfig>;
    music: Record<string, EmojiConfig>;
    owner: Record<string, EmojiConfig>;
    premium: Record<string, EmojiConfig>;
    social: Record<string, EmojiConfig>;
    starboard: Record<string, EmojiConfig>;
    utility: Record<string, EmojiConfig>;
}
declare class EmojiManager {
    private client;
    private cache;
    private registry;
    constructor();
    setClient(client: Client): void;
    /**
     * Resolve an emoji string for a registry entry.
     * Priority: hardcoded ID → name-based lookup in client emoji cache → Unicode fallback.
     *
     * Name-based lookup: if you add emoji to your bot's servers (or an emoji guild) using
     * the exact names listed below (e.g. "music_play", "eco_coins"), the bot will
     * automatically find and use them without any ID configuration needed.
     */
    private resolveEmoji;
    private initializeRegistry;
    /**
     * Get the emoji string for a category/key.
     * Tries hardcoded ID → name lookup in client cache → Unicode fallback.
     */
    get(category: keyof CategoryEmojis, key: string): string;
    /** Get the animated emoji string, or Unicode fallback if not animated/not found. */
    getAnimated(category: keyof CategoryEmojis, key: string): string;
    /** Get a static (non-animated) emoji, falling back to Unicode. */
    getStatic(category: keyof CategoryEmojis, key: string): string;
    /** Get all resolved emoji strings for a category. */
    getAll(category: keyof CategoryEmojis): Record<string, string>;
    /**
     * List all emoji names that should be uploaded to a guild for full animated support.
     * Prints a helpful table for server admins.
     */
    listRequiredEmojis(): Array<{
        name: string;
        animated: boolean;
        category: string;
    }>;
    /**
     * Register a custom emoji ID for a known registry entry.
     * Call this at startup if you have a dedicated emoji guild and known IDs.
     */
    registerEmoji(category: keyof CategoryEmojis, key: string, id: string): void;
    registerCustomEmoji(category: keyof CategoryEmojis, key: string, config: EmojiConfig): void;
    clearCache(): void;
    getRegistry(): CategoryEmojis;
}
export declare const emojiManager: EmojiManager;
export default emojiManager;
//# sourceMappingURL=EmojiManager.d.ts.map