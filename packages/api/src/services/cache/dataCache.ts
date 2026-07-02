/**
 * Data Cache Service
 * 
 * Provides in-memory caching with configurable TTL for external data sources.
 * Reduces API calls and improves performance for frequently accessed data.
 * 
 * Features:
 * - Configurable TTL per cache entry
 * - Automatic expiration
 * - Cache statistics
 * - Type-safe operations
 */

import NodeCache from 'node-cache';

export interface CacheOptions {
  stdTTL?: number; // Default TTL in seconds
  checkperiod?: number; // Period for automatic delete check in seconds
  useClones?: boolean; // Whether to clone variables before returning
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  hitRate: number;
}

export class DataCache {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 3600, // Default 1 hour
      checkperiod: options.checkperiod || 600, // Check every 10 minutes
      useClones: options.useClones !== false, // Default true for safety
    });

    // Log cache events
    this.cache.on('expired', (key, value) => {
      console.log(`[Cache] Key expired: ${key}`);
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hits++;
      console.log(`[Cache] HIT: ${key}`);
      return value;
    }
    
    this.misses++;
    console.log(`[Cache] MISS: ${key}`);
    return undefined;
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || 0);
    
    if (success) {
      const effectiveTTL = ttl || this.cache.options.stdTTL || 0;
      console.log(`[Cache] SET: ${key} (TTL: ${effectiveTTL}s)`);
    }
    
    return success;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const keys = this.cache.keys().length;
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      keys,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get TTL for a key
   */
  getTTL(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// Singleton instances with different TTLs
export const reviewsCache = new DataCache({ 
  stdTTL: 86400, // 24 hours
});

export const pricingCache = new DataCache({ 
  stdTTL: 7200, // 2 hours
});

export const safetyCache = new DataCache({ 
  stdTTL: 86400, // 24 hours
});

// General purpose cache
export const generalCache = new DataCache({ 
  stdTTL: 3600, // 1 hour
});
