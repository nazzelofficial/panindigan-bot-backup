export interface CacheOptions {
    ttl?: number;
    key: string;
}
export interface LazyLoadOptions<T> {
    loader: () => Promise<T>;
    cacheKey: string;
    ttl?: number;
}
declare class PerformanceOptimizer {
    private cacheHits;
    private cacheMisses;
    private apiCalls;
    /**
     * Cache data with automatic expiration
     */
    cache<T>(data: T, options: CacheOptions): Promise<void>;
    /**
     * Get cached data or return null if not found
     */
    getCached<T>(key: string): Promise<T | null>;
    /**
     * Get cached data or load it if not available
     */
    getOrCache<T>(options: LazyLoadOptions<T>): Promise<T>;
    /**
     * Invalidate cache by key pattern
     */
    invalidateCache(pattern: string): Promise<void>;
    /**
     * Lazy load data with caching
     */
    createLazyLoader<T>(options: LazyLoadOptions<T>): () => Promise<T>;
    /**
     * Batch multiple async operations
     */
    batch<T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number): Promise<R[]>;
    /**
     * Debounce function calls
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function calls
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * Memoize function results
     */
    memoize<T extends (...args: any[]) => any>(func: T, ttl?: number): T;
    /**
     * Reduce API calls by batching
     */
    reduceApiCalls<T>(requests: Array<() => Promise<T>>, delay?: number): Promise<T[]>;
    /**
     * Optimize database queries by batching
     */
    batchDbQuery<T>(ids: string[], queryFn: (ids: string[]) => Promise<T[]>): Promise<T[]>;
    /**
     * Get performance statistics
     */
    getStats(): {
        cacheHits: number;
        cacheMisses: number;
        cacheHitRate: number;
        apiCalls: number;
    };
    /**
     * Reset performance statistics
     */
    resetStats(): void;
    /**
     * Create a cached API wrapper
     */
    createCachedApi<T>(apiCall: () => Promise<T>, cacheKey: string, ttl?: number): () => Promise<T>;
    /**
     * Optimize embed building by reusing templates
     */
    createEmbedTemplate<T extends Record<string, any>>(template: T): (data: Partial<T>) => T;
    /**
     * Rate limit function calls
     */
    createRateLimiter<T extends (...args: any[]) => any>(func: T, maxCalls: number, window: number): T;
    /**
     * Optimize pagination by caching pages
     */
    getPaginatedData<T>(page: number, pageSize: number, dataFetcher: (page: number, pageSize: number) => Promise<T[]>, cacheKey: string): Promise<T[]>;
    /**
     * Clean up expired cache entries
     */
    cleanupExpiredCache(pattern: string): Promise<void>;
    /**
     * Optimize image loading by using thumbnails
     */
    getOptimizedImageUrl(url: string, size?: 'small' | 'medium' | 'large'): string;
    /**
     * Reduce memory usage by streaming large datasets
     */
    streamData<T>(data: T[], chunkSize?: number): AsyncGenerator<T[], void, unknown>;
    /**
     * Optimize string operations
     */
    joinStrings(strings: string[], separator?: string): string;
    /**
     * Create a singleton pattern for expensive operations
     */
    createSingleton<T>(factory: () => T): () => T;
}
export declare const performanceOptimizer: PerformanceOptimizer;
export default performanceOptimizer;
//# sourceMappingURL=PerformanceOptimizer.d.ts.map