// @ts-nocheck
import { getCache, setCache } from '../database/redis/client.js';
class PerformanceOptimizer {
    cacheHits = 0;
    cacheMisses = 0;
    apiCalls = 0;
    /**
     * Cache data with automatic expiration
     */
    async cache(data, options) {
        const { ttl = 3600, key } = options;
        await setCache(key, JSON.stringify(data), ttl);
    }
    /**
     * Get cached data or return null if not found
     */
    async getCached(key) {
        const cached = await getCache(key);
        if (cached) {
            this.cacheHits++;
            return JSON.parse(cached);
        }
        this.cacheMisses++;
        return null;
    }
    /**
     * Get cached data or load it if not available
     */
    async getOrCache(options) {
        const cached = await this.getCached(options.cacheKey);
        if (cached !== null) {
            return cached;
        }
        this.apiCalls++;
        const data = await options.loader();
        await this.cache(data, { key: options.cacheKey, ttl: options.ttl });
        return data;
    }
    /**
     * Invalidate cache by key pattern
     */
    async invalidateCache(pattern) {
        const { deleteCachePattern } = await import('../database/redis/client.js');
        await deleteCachePattern(pattern);
    }
    /**
     * Lazy load data with caching
     */
    createLazyLoader(options) {
        return () => this.getOrCache(options);
    }
    /**
     * Batch multiple async operations
     */
    async batch(items, processor, batchSize = 10) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout = null;
        return (...args) => {
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle = false;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    /**
     * Memoize function results
     */
    memoize(func, ttl = 60000) {
        const cache = new Map();
        return ((...args) => {
            const key = JSON.stringify(args);
            const cached = cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                return cached.value;
            }
            const result = func(...args);
            cache.set(key, { value: result, expiry: Date.now() + ttl });
            return result;
        });
    }
    /**
     * Reduce API calls by batching
     */
    async reduceApiCalls(requests, delay = 100) {
        const results = [];
        for (const request of requests) {
            const result = await request();
            results.push(result);
            this.apiCalls++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return results;
    }
    /**
     * Optimize database queries by batching
     */
    async batchDbQuery(ids, queryFn) {
        if (ids.length === 0)
            return [];
        // Batch IDs into groups of 100 to avoid query limits
        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < ids.length; i += batchSize) {
            batches.push(ids.slice(i, i + batchSize));
        }
        const results = await Promise.all(batches.map(queryFn));
        return results.flat();
    }
    /**
     * Get performance statistics
     */
    getStats() {
        const total = this.cacheHits + this.cacheMisses;
        const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
        return {
            cacheHits: this.cacheHits,
            cacheMisses: this.cacheMisses,
            cacheHitRate: hitRate,
            apiCalls: this.apiCalls,
        };
    }
    /**
     * Reset performance statistics
     */
    resetStats() {
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.apiCalls = 0;
    }
    /**
     * Create a cached API wrapper
     */
    createCachedApi(apiCall, cacheKey, ttl = 300) {
        return this.createLazyLoader({
            loader: apiCall,
            cacheKey,
            ttl,
        });
    }
    /**
     * Optimize embed building by reusing templates
     */
    createEmbedTemplate(template) {
        return (data) => ({ ...template, ...data });
    }
    /**
     * Rate limit function calls
     */
    createRateLimiter(func, maxCalls, window) {
        const calls = [];
        return ((...args) => {
            const now = Date.now();
            const callsInWindow = calls.filter(call => call > now - window);
            if (callsInWindow.length >= maxCalls) {
                throw new Error('Rate limit exceeded');
            }
            calls.push(now);
            return func(...args);
        });
    }
    /**
     * Optimize pagination by caching pages
     */
    async getPaginatedData(page, pageSize, dataFetcher, cacheKey) {
        const key = `${cacheKey}:page:${page}`;
        return this.getOrCache({
            cacheKey: key,
            loader: () => dataFetcher(page, pageSize),
            ttl: 300, // 5 minutes
        });
    }
    /**
     * Clean up expired cache entries
     */
    async cleanupExpiredCache(pattern) {
        await this.invalidateCache(pattern);
    }
    /**
     * Optimize image loading by using thumbnails
     */
    getOptimizedImageUrl(url, size = 'medium') {
        // Discord CDN optimization
        if (url.includes('cdn.discordapp.com')) {
            const sizeMap = { small: 64, medium: 256, large: 512 };
            return url.replace(/\.\w+$/, `.${sizeMap[size]}.png`);
        }
        return url;
    }
    /**
     * Reduce memory usage by streaming large datasets
     */
    async *streamData(data, chunkSize = 100) {
        for (let i = 0; i < data.length; i += chunkSize) {
            yield data.slice(i, i + chunkSize);
        }
    }
    /**
     * Optimize string operations
     */
    joinStrings(strings, separator = ', ') {
        return strings.filter(Boolean).join(separator);
    }
    /**
     * Create a singleton pattern for expensive operations
     */
    createSingleton(factory) {
        let instance = null;
        return () => {
            if (instance === null) {
                instance = factory();
            }
            return instance;
        };
    }
}
export const performanceOptimizer = new PerformanceOptimizer();
export default performanceOptimizer;
//# sourceMappingURL=PerformanceOptimizer.js.map