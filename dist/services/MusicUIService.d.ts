import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
export interface Track {
    title: string;
    author: string;
    duration: number;
    thumbnail?: string;
    url: string;
}
export interface QueueDisplayOptions {
    currentTrack: Track;
    queue: Track[];
    position: number;
    volume: number;
    loop: 'none' | 'track' | 'queue';
    paused: boolean;
}
export declare class MusicUIService {
    private static readonly PROGRESS_BAR_LENGTH;
    createMusicPlayerEmbed(options: QueueDisplayOptions): EmbedBuilder;
    createMusicControls(customIdPrefix: string, paused: boolean): ActionRowBuilder<ButtonBuilder>;
    createVolumeControls(customIdPrefix: string, currentVolume: number): ActionRowBuilder<ButtonBuilder>;
    createQueuePagination(customIdPrefix: string, currentPage: number, totalPages: number): ActionRowBuilder<ButtonBuilder>;
    private createProgressBar;
    private createQueueList;
    private formatTime;
    createTrackAddedEmbed(track: Track, position: number): EmbedBuilder;
    createTrackRemovedEmbed(track: Track): EmbedBuilder;
    createQueueClearedEmbed(count: number): EmbedBuilder;
    createShuffleEmbed(): EmbedBuilder;
    createLoopEmbed(mode: 'none' | 'track' | 'queue'): EmbedBuilder;
    createVolumeEmbed(volume: number): EmbedBuilder;
    createNoVoiceChannelEmbed(): EmbedBuilder;
    createNoPlayerEmbed(): EmbedBuilder;
    createEmptyQueueEmbed(): EmbedBuilder;
}
export declare const musicUIService: MusicUIService;
export default musicUIService;
//# sourceMappingURL=MusicUIService.d.ts.map