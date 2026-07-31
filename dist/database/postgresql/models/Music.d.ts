/**
 * Music model helpers — typed wrappers around Prisma's Music operations.
 * Playlists, favorites, and history are stored as JSON arrays in PostgreSQL.
 */
import type { Music } from '@prisma/client';
export interface PlaylistTrack {
    title: string;
    uri: string;
    author: string;
    durationMs: number;
    addedAt: string;
}
export interface Playlist {
    id: string;
    name: string;
    tracks: PlaylistTrack[];
    createdAt: string;
    updatedAt: string;
}
export declare function findOrCreateMusic(userId: string, guildId: string): Promise<Music>;
export declare function getMusic(userId: string, guildId: string): Promise<Music | null>;
export declare function getPlaylists(userId: string, guildId: string): Promise<Playlist[]>;
export declare function getPlaylist(userId: string, guildId: string, name: string): Promise<Playlist | undefined>;
export declare function createPlaylist(userId: string, guildId: string, name: string): Promise<Playlist>;
export declare function addToPlaylist(userId: string, guildId: string, playlistName: string, track: Omit<PlaylistTrack, 'addedAt'>): Promise<void>;
export declare function deletePlaylist(userId: string, guildId: string, name: string): Promise<void>;
export declare function addToHistory(userId: string, guildId: string, track: Omit<PlaylistTrack, 'addedAt'>, maxHistory?: number): Promise<void>;
export declare function getFavorites(userId: string, guildId: string): Promise<PlaylistTrack[]>;
export declare function addFavorite(userId: string, guildId: string, track: Omit<PlaylistTrack, 'addedAt'>): Promise<void>;
//# sourceMappingURL=Music.d.ts.map