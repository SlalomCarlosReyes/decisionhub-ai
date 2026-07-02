/**
 * Base Scraper Class
 * 
 * Abstract base class for all web scrapers with common functionality:
 * - Rate limiting
 * - Caching
 * - Error handling
 * - Timeout management
 * - robots.txt compliance
 * - User-Agent management
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { RateLimiter } from './rateLimiter.js';
import { DataCache } from '../cache/dataCache.js';
import robotsParser from 'robots-parser';

export interface ScraperOptions {
  timeout?: number;
  userAgent?: string;
  respectRobotsTxt?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export abstract class BaseScraper {
  protected axiosInstance: AxiosInstance;
  protected rateLimiter: RateLimiter;
  protected cache: DataCache;
  protected source: string;
  protected options: Required<ScraperOptions>;
  private robotsTxtCache: Map<string, any> = new Map();

  constructor(
    source: string,
    rateLimiter: RateLimiter,
    cache: DataCache,
    options: ScraperOptions = {}
  ) {
    this.source = source;
    this.rateLimiter = rateLimiter;
    this.cache = cache;
    
    this.options = {
      timeout: options.timeout || 10000,
      userAgent: options.userAgent || 'DecisionHub-AI/1.0 (Educational Project; +https://github.com/decisionhub-ai)',
      respectRobotsTxt: options.respectRobotsTxt !== false,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
    };

    this.axiosInstance = axios.create({
      timeout: this.options.timeout,
      headers: {
        'User-Agent': this.options.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    });
  }

  /**
   * Check if we're allowed to scrape a URL according to robots.txt
   */
  protected async isAllowedByRobotsTxt(url: string): Promise<boolean> {
    if (!this.options.respectRobotsTxt) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      
      // Check cache first
      if (this.robotsTxtCache.has(baseUrl)) {
        const robots = this.robotsTxtCache.get(baseUrl);
        return robots.isAllowed(url, this.options.userAgent);
      }

      // Fetch robots.txt
      const robotsUrl = `${baseUrl}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const robots = robotsParser(robotsUrl, response.data);
      
      this.robotsTxtCache.set(baseUrl, robots);
      
      return robots.isAllowed(url, this.options.userAgent);
    } catch (error) {
      // If robots.txt doesn't exist or error, assume allowed
      console.warn(`[${this.source}] Error checking robots.txt:`, error);
      return true;
    }
  }

  /**
   * Fetch HTML content from URL with rate limiting and caching
   */
  protected async fetchHTML(url: string, cacheKey?: string): Promise<cheerio.CheerioAPI | null> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached) {
        console.log(`[${this.source}] Using cached HTML for ${url}`);
        return cheerio.load(cached);
      }
    }

    // Check robots.txt
    const allowed = await this.isAllowedByRobotsTxt(url);
    if (!allowed) {
      console.warn(`[${this.source}] Blocked by robots.txt: ${url}`);
      return null;
    }

    // Fetch with rate limiting
    try {
      const html = await this.rateLimiter.schedule(async () => {
        console.log(`[${this.source}] Fetching: ${url}`);
        const response = await this.axiosInstance.get(url);
        return response.data;
      });

      // Cache the HTML
      if (cacheKey) {
        this.cache.set(cacheKey, html);
      }

      return cheerio.load(html);
    } catch (error) {
      console.error(`[${this.source}] Error fetching ${url}:`, error);
      return null;
    }
  }

  /**
   * Fetch JSON data from API with rate limiting and caching
   */
  protected async fetchJSON<T>(
    url: string, 
    config?: AxiosRequestConfig,
    cacheKey?: string
  ): Promise<T | null> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        console.log(`[${this.source}] Using cached JSON for ${url}`);
        return cached;
      }
    }

    // Fetch with rate limiting
    try {
      const data = await this.rateLimiter.schedule(async () => {
        console.log(`[${this.source}] Fetching JSON: ${url}`);
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
      });

      // Cache the data
      if (cacheKey) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`[${this.source}] Error fetching JSON ${url}:`, error);
      return null;
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.options.maxRetries
  ): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) {
          console.error(`[${this.source}] All ${retries} retries failed`);
          return null;
        }
        
        const delay = this.options.retryDelay * Math.pow(2, i);
        console.warn(`[${this.source}] Retry ${i + 1}/${retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  }

  /**
   * Execute with timeout
   */
  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.options.timeout
  ): Promise<T | null> {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      console.error(`[${this.source}] Timeout or error:`, error);
      return null;
    }
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  abstract scrape(...args: any[]): Promise<any>;
}
