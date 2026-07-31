/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Queue UI
 *  Modern queue display with comprehensive info
 * ═══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { Track, PlayerState } from './MusicUI.js';
export interface QueueDisplayOptions {
    showNowPlaying?: boolean;
    showUpcoming?: boolean;
    showStats?: boolean;
    showControls?: boolean;
    pageSize?: number;
}
export declare function createComprehensiveQueueEmbed(currentTrack: Track, queue: Track[], state: PlayerState, guildName: string, options?: QueueDisplayOptions): EmbedBuilder;
export declare function createMiniQueueEmbed(currentTrack: Track, queue: Track[], guildName: string): EmbedBuilder;
export declare function createQueueActionComponents(guildId: string, state: PlayerState): ActionRowBuilder<ButtonBuilder>[];
export declare function createQueueManagementComponents(prefix: string): ActionRowBuilder<ButtonBuilder>[];
export declare function sendComprehensiveQueue(source: ChatInputCommandInteraction | Message, currentTrack: Track, queue: Track[], state: PlayerState, guildName: string, guildId: string, options?: QueueDisplayOptions): Promise<Message | null>;
export declare function sendMiniQueue(source: ChatInputCommandInteraction | Message, currentTrack: Track, queue: Track[], guildName: string): Promise<Message | null>;
export declare function createQueueAddedEmbed(track: Track, position: number, queueSize: number): EmbedBuilder;
export declare function createQueueRemovedEmbed(track: Track, position: number, queueSize: number): EmbedBuilder;
export declare function createQueueClearedEmbed(count: number): EmbedBuilder;
export declare function createQueueShuffledEmbed(): EmbedBuilder;
export declare function createQueueSavedEmbed(name: string, count: number): EmbedBuilder;
export declare const QueueUI: {
    readonly createComprehensive: typeof createComprehensiveQueueEmbed;
    readonly createMini: typeof createMiniQueueEmbed;
    readonly createActionComponents: typeof createQueueActionComponents;
    readonly createManagementComponents: typeof createQueueManagementComponents;
    readonly sendComprehensive: typeof sendComprehensiveQueue;
    readonly sendMini: typeof sendMiniQueue;
    readonly createAddedEmbed: typeof createQueueAddedEmbed;
    readonly createRemovedEmbed: typeof createQueueRemovedEmbed;
    readonly createClearedEmbed: typeof createQueueClearedEmbed;
    readonly createShuffledEmbed: typeof createQueueShuffledEmbed;
    readonly createSavedEmbed: typeof createQueueSavedEmbed;
};
//# sourceMappingURL=QueueUI.d.ts.map