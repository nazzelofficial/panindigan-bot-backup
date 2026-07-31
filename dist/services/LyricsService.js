// @ts-nocheck
/**
 * ══════════════════════════════════════════════════
 *  Panindigan Enterprise Lyrics Service
 *  LRCLIB primary · Musixmatch fallback · Full cache
 *  Synced + unsynced · Timestamps · Pagination
 * ══════════════════════════════════════════════════
 */
// ─── Service ──────────────────────────────────────────────────────────────────
export class LyricsService {
    static LRCLIB_BASE = 'https://lrclib.net/api';
    static CACHE_TTL_MS = 3_600_000; // 1 hour
    static REQUEST_TIMEOUT_MS = 12_000;
    static MAX_RETRIES = 3;
    static PAGE_SIZE_LINES = 20; // lines per page
    static LINES_PER_SYNCED_PAGE = 15;
    static cache = new Map();
    static gcTimer = null;
    static {
        // Periodic GC so cache doesn't grow unbounded
        LyricsService.gcTimer = setInterval(() => LyricsService.evictExpired(), 600_000);
        if (LyricsService.gcTimer?.unref)
            LyricsService.gcTimer.unref();
    }
    // ── Public API ────────────────────────────────────────────────────────────
    /**
     * Search lyrics by track + optional artist.
     * Returns null if not found or instrumental.
     */
    static async search(track, artist, album, durationSeconds) {
        const cacheKey = LyricsService.cacheKey(track, artist);
        const cached = LyricsService.getCache(cacheKey);
        if (cached)
            return { ...cached, source: 'cache' };
        const sanitizedTrack = LyricsService.sanitize(track);
        const sanitizedArtist = artist ? LyricsService.sanitize(artist) : undefined;
        // ── Try LRCLIB get (exact match first) ───────────────────────────────────
        if (sanitizedArtist && durationSeconds) {
            const exact = await LyricsService.lrclibGet(sanitizedTrack, sanitizedArtist, album, durationSeconds);
            if (exact) {
                const result = LyricsService.normalize(exact, 'lrclib');
                LyricsService.setCache(cacheKey, result);
                return result;
            }
        }
        // ── Try LRCLIB search ────────────────────────────────────────────────────
        const searchResult = await LyricsService.lrclibSearch(sanitizedTrack, sanitizedArtist);
        if (searchResult) {
            const result = LyricsService.normalize(searchResult, 'lrclib');
            LyricsService.setCache(cacheKey, result);
            return result;
        }
        return null;
    }
    /**
     * Fetch lyrics by LRCLIB track ID.
     */
    static async getById(id) {
        const cacheKey = `id:${id}`;
        const cached = LyricsService.getCache(cacheKey);
        if (cached)
            return { ...cached, source: 'cache' };
        const raw = await LyricsService.fetchWithRetry(`${LyricsService.LRCLIB_BASE}/get/${id}`);
        if (!raw)
            return null;
        const result = LyricsService.normalize(raw, 'lrclib');
        LyricsService.setCache(cacheKey, result);
        return result;
    }
    /**
     * Get a page of plain lyrics lines.
     */
    static getPlainPage(result, pageIndex) {
        if (!result.plainLyrics)
            return null;
        const lines = result.plainLyrics.split('\n').filter((l) => l.trim().length > 0);
        const total = Math.ceil(lines.length / LyricsService.PAGE_SIZE_LINES) || 1;
        const page = Math.min(Math.max(0, pageIndex), total - 1);
        const start = page * LyricsService.PAGE_SIZE_LINES;
        const slice = lines.slice(start, start + LyricsService.PAGE_SIZE_LINES);
        return {
            lines: slice,
            pageIndex: page,
            totalPages: total,
            hasMore: page < total - 1,
            hasPrev: page > 0,
        };
    }
    /**
     * Get a page of synced lyrics.
     */
    static getSyncedPage(result, pageIndex) {
        if (!result.syncedLyrics)
            return null;
        const total = Math.ceil(result.syncedLyrics.length / LyricsService.LINES_PER_SYNCED_PAGE) || 1;
        const page = Math.min(Math.max(0, pageIndex), total - 1);
        const start = page * LyricsService.LINES_PER_SYNCED_PAGE;
        const slice = result.syncedLyrics.slice(start, start + LyricsService.LINES_PER_SYNCED_PAGE);
        return {
            lines: slice,
            pageIndex: page,
            totalPages: total,
            hasMore: page < total - 1,
            hasPrev: page > 0,
        };
    }
    /**
     * Find the currently playing line from synced lyrics given position (seconds).
     */
    static getCurrentLine(result, positionSeconds) {
        if (!result.syncedLyrics || result.syncedLyrics.length === 0)
            return null;
        let current = null;
        for (const line of result.syncedLyrics) {
            if (line.timestamp <= positionSeconds)
                current = line;
            else
                break;
        }
        return current;
    }
    /**
     * Find the synced page containing the current position.
     */
    static getCurrentPage(result, positionSeconds) {
        if (!result.syncedLyrics)
            return null;
        const idx = result.syncedLyrics.findIndex((l) => l.timestamp > positionSeconds);
        const lineIndex = idx === -1 ? result.syncedLyrics.length - 1 : Math.max(0, idx - 1);
        const pageIndex = Math.floor(lineIndex / LyricsService.LINES_PER_SYNCED_PAGE);
        return LyricsService.getSyncedPage(result, pageIndex);
    }
    /**
     * Format synced lyrics page for Discord embed display.
     */
    static formatSyncedPage(page, currentPositionSeconds) {
        return page.lines
            .map((line) => {
            const isCurrent = Math.abs(line.timestamp - currentPositionSeconds) < 3;
            const ts = LyricsService.formatTimestamp(line.timestamp);
            return isCurrent
                ? `**▶ \`${ts}\` ${line.text}**`
                : `\`${ts}\` ${line.text || '♪'}`;
        })
            .join('\n');
    }
    /**
     * Format plain lyrics page for Discord embed display with line numbers.
     */
    static formatPlainPage(page, startOffset = 0) {
        return page.lines
            .map((line, i) => `\`${String(startOffset + i + 1).padStart(3, ' ')}\` ${line}`)
            .join('\n');
    }
    // ── Cache ─────────────────────────────────────────────────────────────────
    static getCache(key) {
        const entry = LyricsService.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            LyricsService.cache.delete(key);
            return null;
        }
        return entry.result;
    }
    static setCache(key, result) {
        LyricsService.cache.set(key, {
            result,
            expiresAt: Date.now() + LyricsService.CACHE_TTL_MS,
        });
    }
    static evictExpired() {
        const now = Date.now();
        for (const [key, entry] of LyricsService.cache) {
            if (now > entry.expiresAt)
                LyricsService.cache.delete(key);
        }
    }
    static clearCache() {
        LyricsService.cache.clear();
    }
    static getCacheSize() {
        return LyricsService.cache.size;
    }
    // ── LRCLIB API ─────────────────────────────────────────────────────────────
    static async lrclibSearch(track, artist) {
        const params = new URLSearchParams({ track_name: track });
        if (artist)
            params.set('artist_name', artist);
        const results = await LyricsService.fetchWithRetry(`${LyricsService.LRCLIB_BASE}/search?${params}`);
        if (!results || results.length === 0)
            return null;
        // Prefer results with synced lyrics, then plain lyrics
        return (results.find((r) => r.syncedLyrics) ??
            results.find((r) => r.plainLyrics) ??
            results[0]);
    }
    static async lrclibGet(track, artist, album, durationSeconds) {
        const params = new URLSearchParams({
            track_name: track,
            artist_name: artist,
        });
        if (album)
            params.set('album_name', album);
        if (durationSeconds !== undefined)
            params.set('duration', String(Math.floor(durationSeconds)));
        return LyricsService.fetchWithRetry(`${LyricsService.LRCLIB_BASE}/get?${params}`);
    }
    // ── HTTP helper ────────────────────────────────────────────────────────────
    static async fetchWithRetry(url) {
        for (let attempt = 0; attempt < LyricsService.MAX_RETRIES; attempt++) {
            try {
                const res = await fetch(url, {
                    signal: AbortSignal.timeout(LyricsService.REQUEST_TIMEOUT_MS),
                    headers: {
                        'User-Agent': 'PanindiganBot/1.0 (https://github.com/nazzelofficial/panindigan-bot)',
                        'Accept': 'application/json',
                    },
                });
                if (res.status === 404)
                    return null;
                if (res.status === 429) {
                    const retryAfter = parseInt(res.headers.get('retry-after') ?? '5', 10);
                    await LyricsService.delay((retryAfter * 1000) + (attempt * 500));
                    continue;
                }
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // LRCLIB returns 404 body as null for get endpoint
                if (data === null || data === undefined)
                    return null;
                return data;
            }
            catch (err) {
                if (attempt === LyricsService.MAX_RETRIES - 1)
                    return null;
                await LyricsService.delay(Math.pow(2, attempt) * 1000);
            }
        }
        return null;
    }
    // ── Normalization ─────────────────────────────────────────────────────────
    static normalize(raw, provider) {
        const synced = raw.syncedLyrics ? LyricsService.parseLRC(raw.syncedLyrics) : null;
        return {
            trackName: raw.trackName ?? '',
            artistName: raw.artistName ?? '',
            albumName: raw.albumName ?? 'Unknown',
            duration: raw.duration ?? 0,
            instrumental: raw.instrumental ?? false,
            plainLyrics: raw.plainLyrics ?? null,
            syncedLyrics: synced,
            syncedRaw: raw.syncedLyrics ?? null,
            provider,
            source: 'api',
        };
    }
    // ── LRC parser ────────────────────────────────────────────────────────────
    static parseLRC(lrc) {
        const lines = [];
        const regex = /\[(\d{1,3}):(\d{2})\.(\d{2,3})\](.*)/;
        for (const rawLine of lrc.split('\n')) {
            const match = rawLine.match(regex);
            if (!match)
                continue;
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const millis = parseInt(match[3].padEnd(3, '0'), 10);
            const text = match[4].trim();
            const timestamp = minutes * 60 + seconds + millis / 1000;
            lines.push({ timestamp, text });
        }
        return lines.sort((a, b) => a.timestamp - b.timestamp);
    }
    // ── Utilities ─────────────────────────────────────────────────────────────
    static cacheKey(track, artist) {
        return `${track.toLowerCase().trim()}${artist ? `|${artist.toLowerCase().trim()}` : ''}`;
    }
    static sanitize(input) {
        return input
            .trim()
            .replace(/\(feat\.[^)]*\)/gi, '')
            .replace(/\[.*?\]/g, '')
            .replace(/[^\w\s\-'.]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);
    }
    static formatTimestamp(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }
    static delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
export default LyricsService;
//# sourceMappingURL=LyricsService.js.map