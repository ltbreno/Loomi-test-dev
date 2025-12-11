import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result ?? null;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('Error resetting cache:', error);
    }
  }
}
