// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Bot Lyrics Service
 *  LRCLIB API Integration for Lyrics
 * ═══════════════════════════════════════════════════
 */

import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { COLORS } from '../constants/DesignSystem.js';

interface LRCLIBResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  instrumental: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

interface LyricsCache {
  data: LRCLIBResponse;
  timestamp: number;
}

interface LyricsPage {
  content: string;
  pageNumber: number;
  totalPages: number;
}

export class LyricsService {
  private static readonly API_BASE = 'https://lrclib.net/api';
  private static readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 3;
  private static readonly PAGE_SIZE = 1000; // Characters per page

  private static cache: Map<string, LyricsCache> = new Map();

  /**
   * Search for lyrics using LRCLIB API
   */
  public static async searchLyrics(
    track: string,
    artist?: string,
  ): Promise<LRCLIBResponse | null> {
    const cacheKey = this.getCacheKey(track, artist);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Sanitize input
    const sanitizedTrack = this.sanitizeInput(track);
    const sanitizedArtist = artist ? this.sanitizeInput(artist) : undefined;

    // Build query
    const query = new URLSearchParams();
    query.append('track_name', sanitizedTrack);
    if (sanitizedArtist) {
      query.append('artist_name', sanitizedArtist);
    }

    // Try with retries
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(
          `${this.API_BASE}/search?${query.toString()}`,
          {
            signal: AbortSignal.timeout(this.REQUEST_TIMEOUT),
            headers: {
              'User-Agent': 'PanindiganBot/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: LRCLIBResponse[] = await response.json();

        if (!data || data.length === 0) {
          return null;
        }

        // Get the first result with lyrics
        const result = data.find(
          (item) => item.plainLyrics || item.syncedLyrics
        ) || data[0];

        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        if (attempt === this.MAX_RETRIES - 1) {
          console.error('Lyrics search failed:', error);
          return null;
        }
        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    return null;
  }

  /**
   * Get lyrics by ID (for more precise results)
   */
  public static async getLyricsById(id: number): Promise<LRCLIBResponse | null> {
    const cacheKey = `id:${id}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.API_BASE}/lrclib?id=${id}`, {
        signal: AbortSignal.timeout(this.REQUEST_TIMEOUT),
        headers: {
          'User-Agent': 'PanindiganBot/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data: LRCLIBResponse = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Failed to get lyrics by ID:', error);
      return null;
    }
  }

  /**
   * Paginate lyrics for display
   */
  public static paginateLyrics(lyrics: string, pageSize: number = this.PAGE_SIZE): LyricsPage[] {
    if (!lyrics) return [];

    const lines = lyrics.split('\n');
    const pages: LyricsPage[] = [];
    let currentPage = '';
    let pageNumber = 1;

    for (const line of lines) {
      if ((currentPage + line).length > pageSize) {
        pages.push({
          content: currentPage.trim(),
          pageNumber,
          totalPages: 0, // Will be calculated at the end
        });
        currentPage = line + '\n';
        pageNumber++;
      } else {
        currentPage += line + '\n';
      }
    }

    if (currentPage.trim()) {
      pages.push({
        content: currentPage.trim(),
        pageNumber,
        totalPages: 0,
      });
    }

    // Set total pages
    const totalPages = pages.length;
    return pages.map(page => ({ ...page, totalPages }));
  }

  /**
   * Parse synced lyrics (LRC format)
   */
  public static parseSyncedLyrics(syncedLyrics: string): Array<{ time: number; text: string }> {
    if (!syncedLyrics) return [];

    const lines = syncedLyrics.split('\n');
    const parsed: Array<{ time: number; text: string }> = [];

    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const text = match[4].trim();
        const time = minutes * 60 + seconds + milliseconds / 1000;
        parsed.push({ time, text });
      }
    }

    return parsed;
  }

  /**
   * Create lyrics embed
   */
  public static createLyricsEmbed(
    data: LRCLIBResponse,
    page: LyricsPage,
    source: 'synced' | 'plain' = 'plain',
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🎵 ${data.trackName}`)
      .setColor(COLORS.music)
      .addFields(
        { name: '👤 Artist', value: data.artistName, inline: true },
        { name: '💿 Album', value: data.albumName || 'Unknown', inline: true },
        { name: '⏱️ Duration', value: this.formatDuration(data.duration), inline: true },
        { name: '📝 Source', value: source === 'synced' ? 'Synced (LRC)' : 'Plain Text', inline: true },
      )
      .setDescription(page.content)
      .setFooter({ 
        text: `Page ${page.pageNumber}/${page.totalPages} • Source: LRCLIB.net`,
      })
      .setTimestamp();

    return embed;
  }

  /**
   * Create loading embed
   */
  public static createLoadingEmbed(track: string, artist?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Searching Lyrics')
      .setColor(COLORS.info)
      .setDescription(`Searching for lyrics for **${track}**${artist ? ` by ${artist}` : ''}...`)
      .addFields(
        { name: '🔍 Status', value: 'Searching...', inline: true },
        { name: '📡 Source', value: 'LRCLIB.net', inline: true },
      )
      .setTimestamp();

    return embed;
  }

  /**
   * Create error embed
   */
  public static createErrorEmbed(track: string, artist?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('❌ Lyrics Not Found')
      .setColor(COLORS.error)
      .setDescription(`No lyrics found for **${track}**${artist ? ` by ${artist}` : ''}`)
      .addFields(
        { name: '💡 Tip', value: 'Try searching with just the song title or check if the spelling is correct.', inline: false },
        { name: '📡 Source', value: 'LRCLIB.net', inline: true },
      )
      .setTimestamp();

    return embed;
  }

  /**
   * Create instrumental embed
   */
  public static createInstrumentalEmbed(data: LRCLIBResponse): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Instrumental Track')
      .setColor(COLORS.warning)
      .setDescription(`**${data.trackName}** by ${data.artistName} is an instrumental track and has no lyrics.`)
      .addFields(
        { name: '👤 Artist', value: data.artistName, inline: true },
        { name: '💿 Album', value: data.albumName || 'Unknown', inline: true },
      )
      .setTimestamp();

    return embed;
  }

  /**
   * Clear cache (for maintenance)
   */
  public static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  public static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  public static getCacheSize(): number {
    return this.cache.size;
  }

  // Private helper methods

  private static getCacheKey(track: string, artist?: string): string {
    return `${track.toLowerCase()}${artist ? `:${artist.toLowerCase()}` : ''}`;
  }

  private static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[^\w\s\-']/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 100);
  }

  private static formatDuration(seconds?: number): string {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default LyricsService;
