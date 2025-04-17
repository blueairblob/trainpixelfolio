// src/utils/filterCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'filter_cache_';
const DEFAULT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Cache item interface
interface CachedFilter<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Save filter options to AsyncStorage cache
 * 
 * @param key The filter type key
 * @param data The filter data to cache
 * @param duration Optional cache duration in milliseconds (defaults to 24 hours)
 */
export const cacheFilterOptions = async <T>(
  key: string, 
  data: T, 
  duration: number = DEFAULT_CACHE_DURATION
): Promise<void> => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const timestamp = Date.now();
    const cacheItem: CachedFilter<T> = {
      data,
      timestamp,
      expiry: timestamp + duration
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    console.log(`Cached ${key} filter options`);
  } catch (error) {
    console.error(`Error caching ${key} filter options:`, error);
  }
};

/**
 * Get cached filter options if they exist and haven't expired
 * 
 * @param key The filter type key
 * @returns The cached data or null if not found/expired
 */
export const getCachedFilterOptions = async <T>(key: string): Promise<T | null> => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      console.log(`No cached data found for ${key}`);
      return null;
    }
    
    const cacheItem = JSON.parse(cachedData) as CachedFilter<T>;
    const now = Date.now();
    
    // Check if cache has expired
    if (now > cacheItem.expiry) {
      console.log(`Cache expired for ${key}`);
      // Clean up expired cache item
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    console.log(`Using cached ${key} filter options from ${new Date(cacheItem.timestamp).toLocaleTimeString()}`);
    return cacheItem.data;
  } catch (error) {
    console.error(`Error getting cached ${key} filter options:`, error);
    return null;
  }
};

/**
 * Clear a specific filter cache
 * 
 * @param key The filter type key
 */
export const clearFilterCache = async (key: string): Promise<void> => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    await AsyncStorage.removeItem(cacheKey);
    console.log(`Cleared cache for ${key}`);
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
};

/**
 * Clear all filter caches
 */
export const clearAllFilterCaches = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const filterCacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (filterCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(filterCacheKeys);
      console.log(`Cleared ${filterCacheKeys.length} filter caches`);
    }
  } catch (error) {
    console.error('Error clearing all filter caches:', error);
  }
};

/**
 * Get cache age in seconds
 * 
 * @param key The filter type key
 * @returns Age in seconds or null if not found
 */
export const getFilterCacheAge = async (key: string): Promise<number | null> => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const cacheItem = JSON.parse(cachedData) as CachedFilter<any>;
    const ageInMs = Date.now() - cacheItem.timestamp;
    return Math.floor(ageInMs / 1000); // Convert to seconds
  } catch (error) {
    console.error(`Error getting cache age for ${key}:`, error);
    return null;
  }
};