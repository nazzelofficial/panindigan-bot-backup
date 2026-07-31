/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Lyrics Service
 *  LRCLIB primary · Musixmatch fallback · Full cache
 *  Synced + unsynced · Timestamps · Pagination
 * ══════════════════════════════════════════════════
 */
export interface SyncedLine {
    timestamp: number;
    text: string;
}
export interface LyricsResult {
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string | null;
    syncedLyrics: SyncedLine[] | null;
    syncedRaw: string | null;
    provider: string;
    source: 'cache' | 'api';
}
export interface LyricsPage {
    lines: string[];
    pageIndex: number;
    totalPages: number;
    hasMore: boolean;
    hasPrev: boolean;
}
export interface SyncedPage {
    lines: SyncedLine[];
    pageIndex: number;
    totalPages: number;
    hasMore: boolean;
    hasPrev: boolean;
}
export declare class LyricsService {
    private static readonly LRCLIB_BASE;
    private static readonly CACHE_TTL_MS;
    private static readonly REQUEST_TIMEOUT_MS;
    private static readonly MAX_RETRIES;
    private static readonly PAGE_SIZE_LINES;
    private static readonly LINES_PER_SYNCED_PAGE;
    private static readonly cache;
    private static gcTimer;
    /**
     * Search lyrics by track + optional artist.
     * Returns null if not found or instrumental.
     */
    static search(track: string, artist?: string, album?: string, durationSeconds?: number): Promise<LyricsResult | null>;
    /**
     * Fetch lyrics by LRCLIB track ID.
     */
    static getById(id: number): Promise<LyricsResult | null>;
    /**
     * Get a page of plain lyrics lines.
     */
    static getPlainPage(result: LyricsResult, pageIndex: number): LyricsPage | null;
    /**
     * Get a page of synced lyrics.
     */
    static getSyncedPage(result: LyricsResult, pageIndex: number): SyncedPage | null;
    /**
     * Find the currently playing line from synced lyrics given position (seconds).
     */
    static getCurrentLine(result: LyricsResult, positionSeconds: number): SyncedLine | null;
    /**
     * Find the synced page containing the current position.
     */
    static getCurrentPage(result: LyricsResult, positionSeconds: number): SyncedPage | null;
    /**
     * Format synced lyrics page for Discord embed display.
     */
    static formatSyncedPage(page: SyncedPage, currentPositionSeconds: number): string;
    /**
     * Format plain lyrics page for Discord embed display with line numbers.
     */
    static formatPlainPage(page: LyricsPage, startOffset?: number): string;
    private static getCache;
    private static setCache;
    static evictExpired(): void;
    static clearCache(): void;
    static getCacheSize(): number;
    private static lrclibSearch;
    private static lrclibGet;
    private static fetchWithRetry;
    private static normalize;
    private static parseLRC;
    private static cacheKey;
    private static sanitize;
    private static formatTimestamp;
    private static delay;
}
export default LyricsService;
//# sourceMappingURL=LyricsService.d.ts.map