// @ts-nocheck
import { getCache, setCache, deleteCache } from '../database/redis/client.js';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

export interface LazyLoadOptions<T> {
  loader: () => Promise<T>;
  cacheKey: string;
  ttl?: number;
}

class PerformanceOptimizer {
  private cacheHits = 0;
  private cacheMisses = 0;
  private apiCalls = 0;

  /**
   * Cache data with automatic expiration
   */
  public async cache<T>(data: T, options: CacheOptions): Promise<void> {
    const { ttl = 3600, key } = options;
    await setCache(key, JSON.stringify(data), ttl);
  }

  /**
   * Get cached data or return null if not found
   */
  public async getCached<T>(key: string): Promise<T | null> {
    const cached = await getCache(key);
    if (cached) {
      this.cacheHits++;
      return JSON.parse(cached) as T;
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Get cached data or load it if not available
   */
  public async getOrCache<T>(options: LazyLoadOptions<T>): Promise<T> {
    const cached = await this.getCached<T>(options.cacheKey);
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
  public async invalidateCache(pattern: string): Promise<void> {
    const { deleteCachePattern } = await import('../database/redis/client.js');
    await deleteCachePattern(pattern);
  }

  /**
   * Lazy load data with caching
   */
  public createLazyLoader<T>(options: LazyLoadOptions<T>): () => Promise<T> {
    return () => this.getOrCache(options);
  }

  /**
   * Batch multiple async operations
   */
  public async batch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
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
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
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
  public memoize<T extends (...args: any[]) => any>(
    func: T,
    ttl: number = 60000
  ): T {
    const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }

      const result = func(...args);
      cache.set(key, { value: result, expiry: Date.now() + ttl });
      return result;
    }) as T;
  }

  /**
   * Reduce API calls by batching
   */
  public async reduceApiCalls<T>(
    requests: Array<() => Promise<T>>,
    delay: number = 100
  ): Promise<T[]> {
    const results: T[] = [];

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
  public async batchDbQuery<T>(
    ids: string[],
    queryFn: (ids: string[]) => Promise<T[]>
  ): Promise<T[]> {
    if (ids.length === 0) return [];
    
    // Batch IDs into groups of 100 to avoid query limits
    const batchSize = 100;
    const batches: string[][] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    const results = await Promise.all(batches.map(queryFn));
    return results.flat();
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    apiCalls: number;
  } {
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
  public resetStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.apiCalls = 0;
  }

  /**
   * Create a cached API wrapper
   */
  public createCachedApi<T>(
    apiCall: () => Promise<T>,
    cacheKey: string,
    ttl: number = 300
  ): () => Promise<T> {
    return this.createLazyLoader({
      loader: apiCall,
      cacheKey,
      ttl,
    });
  }

  /**
   * Optimize embed building by reusing templates
   */
  public createEmbedTemplate<T extends Record<string, any>>(
    template: T
  ): (data: Partial<T>) => T {
    return (data: Partial<T>) => ({ ...template, ...data });
  }

  /**
   * Rate limit function calls
   */
  public createRateLimiter<T extends (...args: any[]) => any>(
    func: T,
    maxCalls: number,
    window: number
  ): T {
    const calls: number[] = [];

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      const callsInWindow = calls.filter(call => call > now - window);

      if (callsInWindow.length >= maxCalls) {
        throw new Error('Rate limit exceeded');
      }

      calls.push(now);
      return func(...args);
    }) as T;
  }

  /**
   * Optimize pagination by caching pages
   */
  public async getPaginatedData<T>(
    page: number,
    pageSize: number,
    dataFetcher: (page: number, pageSize: number) => Promise<T[]>,
    cacheKey: string
  ): Promise<T[]> {
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
  public async cleanupExpiredCache(pattern: string): Promise<void> {
    await this.invalidateCache(pattern);
  }

  /**
   * Optimize image loading by using thumbnails
   */
  public getOptimizedImageUrl(url: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
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
  public async* streamData<T>(
    data: T[],
    chunkSize: number = 100
  ): AsyncGenerator<T[], void, unknown> {
    for (let i = 0; i < data.length; i += chunkSize) {
      yield data.slice(i, i + chunkSize);
    }
  }

  /**
   * Optimize string operations
   */
  public joinStrings(strings: string[], separator: string = ', '): string {
    return strings.filter(Boolean).join(separator);
  }

  /**
   * Create a singleton pattern for expensive operations
   */
  public createSingleton<T>(factory: () => T): () => T {
    let instance: T | null = null;

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
