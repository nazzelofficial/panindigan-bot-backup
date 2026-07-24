import fetch from 'node-fetch';

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

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  public isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const creds = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error('Failed to get Spotify access token.');
    const data: any = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  public async searchTracks(query: string, limit = 5): Promise<SpotifyTrack[]> {
    if (!this.isConfigured()) throw new Error('Spotify is not configured (SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET required).');

    const token = await this.getAccessToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

    const data: any = await res.json();
    return (data.tracks?.items || []).map(this.mapTrack);
  }

  public async getTrack(trackId: string): Promise<SpotifyTrack> {
    if (!this.isConfigured()) throw new Error('Spotify is not configured.');

    const token = await this.getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Track not found.`);
    const data: any = await res.json();
    return this.mapTrack(data);
  }

  public async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    if (!this.isConfigured()) throw new Error('Spotify is not configured.');

    const token = await this.getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Playlist not found.`);
    const data: any = await res.json();
    return (data.items || []).map((item: any) => this.mapTrack(item.track)).filter(Boolean);
  }

  public async getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    if (!this.isConfigured()) throw new Error('Spotify is not configured.');

    const token = await this.getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=PH`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Artist not found.`);
    const data: any = await res.json();
    return (data.tracks || []).map(this.mapTrack);
  }

  private mapTrack(track: any): SpotifyTrack {
    return {
      id: track.id,
      name: track.name,
      artists: (track.artists || []).map((a: any) => a.name),
      album: track.album?.name || '',
      albumArt: track.album?.images?.[0]?.url || '',
      duration: track.duration_ms || 0,
      url: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
      previewUrl: track.preview_url || null,
    };
  }

  public formatDuration(ms: number): string {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${String(sec).padStart(2, '0')}`;
  }
}

export const spotifyService = new SpotifyService();
