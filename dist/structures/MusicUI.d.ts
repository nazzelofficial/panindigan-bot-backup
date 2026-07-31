/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Music UI
 *  Premium music player with modern design
 * ═══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
export interface Track {
    title: string;
    artist: string;
    album?: string;
    duration: number;
    position: number;
    thumbnail?: string;
    url?: string;
    requester: string;
    source: string;
}
export interface PlayerState {
    paused: boolean;
    loop: 'none' | 'track' | 'queue';
    shuffle: boolean;
    volume: number;
    autoplay: boolean;
    nightcore: boolean;
    bassboost: boolean;
    vaporwave: boolean;
}
export interface QueueInfo {
    currentTrack: Track;
    queue: Track[];
    totalDuration: number;
}
export declare function createMusicPlayerEmbed(track: Track, state: PlayerState, queueInfo: QueueInfo, guildName: string): EmbedBuilder;
export declare function formatDuration(ms: number): string;
declare function formatControls(state: PlayerState): string;
export declare function createMusicPlayerComponents(guildId: string, state: PlayerState): ActionRowBuilder<ButtonBuilder>[];
export declare function createMusicFilterComponents(guildId: string): ActionRowBuilder<ButtonBuilder>;
export declare function createQueueEmbed(currentTrack: Track, queue: Track[], state: PlayerState, guildName: string, page?: number, pageSize?: number): EmbedBuilder;
export declare function sendMusicPlayer(source: ChatInputCommandInteraction | Message, track: Track, state: PlayerState, queueInfo: QueueInfo, guildName: string, guildId: string): Promise<Message | null>;
export declare function updateMusicPlayer(message: Message, track: Track, state: PlayerState, queueInfo: QueueInfo, guildName: string, guildId: string): Promise<void>;
export declare function sendQueue(source: ChatInputCommandInteraction | Message, currentTrack: Track, queue: Track[], state: PlayerState, guildName: string, guildId: string, page?: number): Promise<Message | null>;
export declare function createSearchResultsEmbed(query: string, results: Track[], guildName: string): EmbedBuilder;
export declare function createNoResultsEmbed(query: string): EmbedBuilder;
export declare function createNotInVoiceEmbed(): EmbedBuilder;
export declare function createNoTrackPlayingEmbed(): EmbedBuilder;
export declare function createQueueEmptyEmbed(): EmbedBuilder;
export declare function createAddedToQueueEmbed(track: Track, position: number): EmbedBuilder;
export declare function createTrackStartedEmbed(track: Track): EmbedBuilder;
export declare function createTrackEndedEmbed(track: Track): EmbedBuilder;
export declare const MusicUI: {
    readonly createPlayerEmbed: typeof createMusicPlayerEmbed;
    readonly createPlayerComponents: typeof createMusicPlayerComponents;
    readonly createFilterComponents: typeof createMusicFilterComponents;
    readonly createQueueEmbed: typeof createQueueEmbed;
    readonly createSearchResultsEmbed: typeof createSearchResultsEmbed;
    readonly createNoResultsEmbed: typeof createNoResultsEmbed;
    readonly createNotInVoiceEmbed: typeof createNotInVoiceEmbed;
    readonly createNoTrackPlayingEmbed: typeof createNoTrackPlayingEmbed;
    readonly createQueueEmptyEmbed: typeof createQueueEmptyEmbed;
    readonly createAddedToQueueEmbed: typeof createAddedToQueueEmbed;
    readonly createTrackStartedEmbed: typeof createTrackStartedEmbed;
    readonly createTrackEndedEmbed: typeof createTrackEndedEmbed;
    readonly sendPlayer: typeof sendMusicPlayer;
    readonly updatePlayer: typeof updateMusicPlayer;
    readonly sendQueue: typeof sendQueue;
    readonly formatDuration: typeof formatDuration;
    readonly formatControls: typeof formatControls;
};
export {};
//# sourceMappingURL=MusicUI.d.ts.map