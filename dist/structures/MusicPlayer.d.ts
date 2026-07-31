/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Music Player
 *  Modern embeds · Animated emoji fallback · Full UI
 * ══════════════════════════════════════════════════
 */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
export declare function formatDuration(ms: number): string;
export declare function getProgressBar(current: number, total: number, length?: number): string;
export declare function getProgressBarWithKnob(current: number, total: number, length?: number): string;
export declare class MusicPlayer {
    static formatDuration: typeof formatDuration;
    static getProgressBar: typeof getProgressBar;
    static getNowPlayingEmbed(player: KazagumoPlayer): EmbedBuilder;
    static getQueueEmbed(player: KazagumoPlayer, page?: number, perPage?: number): EmbedBuilder;
    static getSearchEmbed(query: string, results: KazagumoTrack[]): EmbedBuilder;
    static buildControlButtons(player: KazagumoPlayer): ActionRowBuilder<ButtonBuilder>;
    static buildVolumeButtons(player: KazagumoPlayer): ActionRowBuilder<ButtonBuilder>;
    static buildFilterButtons(activeFilters: Set<string>): ActionRowBuilder<ButtonBuilder>;
    static buildSearchSelect(results: KazagumoTrack[], query: string): ActionRowBuilder<StringSelectMenuBuilder>;
    static errorEmbed(title: string, description: string): EmbedBuilder;
    static successEmbed(title: string, description: string): EmbedBuilder;
    static infoEmbed(title: string, description: string): EmbedBuilder;
    static buildLyricsEmbed(trackName: string, artistName: string, content: string, pageInfo: {
        current: number;
        total: number;
    }, options?: {
        synced?: boolean;
        instrumental?: boolean;
    }): EmbedBuilder;
    static buildFilterStatusEmbed(player: KazagumoPlayer, activeFilters: string[]): EmbedBuilder;
    static buildAddedEmbed(track: KazagumoTrack, position: number, player: KazagumoPlayer): EmbedBuilder;
    static buildPlaylistEmbed(playlistName: string, trackCount: number, totalDuration: number, source: string): EmbedBuilder;
}
//# sourceMappingURL=MusicPlayer.d.ts.map