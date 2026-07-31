export interface SpotifyTrack {
    id: string;
    name: string;
    artists: string[];
    album: string;
    albumArt: string;
    duration: number;
    url: string;
    previewUrl: string | null;
}
export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    owner: string;
    tracks: number;
    url: string;
    image: string;
    isPublic: boolean;
}
export declare class SpotifyService {
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiry;
    constructor();
    isConfigured(): boolean;
    private getAccessToken;
    searchTracks(query: string, limit?: number): Promise<SpotifyTrack[]>;
    getTrack(trackId: string): Promise<SpotifyTrack>;
    getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]>;
    getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]>;
    private mapTrack;
    formatDuration(ms: number): string;
}
export declare const spotifyService: SpotifyService;
//# sourceMappingURL=SpotifyService.d.ts.map