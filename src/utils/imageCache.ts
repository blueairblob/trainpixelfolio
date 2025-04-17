// src/utils/imageCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { getCachedPhotoData, cachePhotoData } from './cache'; // Import existing cache functions for compatibility

// Constants
const CACHE_PREFIX = 'app_cache_';
const DEFAULT_EXPIRY_MINUTES = 60 * 24 * 7; // 7 days

/**
 * Cache interface for stored items
 */
interface CacheItem<T> {
  data: T;
  expiry: number; // timestamp
}

/**
 * Pre-load and cache images
 */
export const prefetchImage = async (uri: string): Promise<boolean> => {
  try {
    await Image.prefetch(uri);
    // Mark this URL as prefetched
    await AsyncStorage.setItem(`${CACHE_PREFIX}img_prefetched_${uri}`, 'true');
    return true;
  } catch (error) {
    console.error('Error prefetching image:', error);
    return false;
  }
};

/**
 * Check if an image has been prefetched
 */
export const isImagePrefetched = async (uri: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(`${CACHE_PREFIX}img_prefetched_${uri}`);
    return value === 'true';
  } catch (error) {
    console.error('Error checking if image is prefetched:', error);
    return false;
  }
};

/**
 * Cache API data with expiry
 */
export const cacheApiData = async <T>(
  key: string, 
  data: T, 
  expiryMinutes: number = DEFAULT_EXPIRY_MINUTES
): Promise<void> => {
  try {
    // Forward to existing cache function if possible for backward compatibility
    if (typeof cachePhotoData === 'function') {
      await cachePhotoData(key, data, expiryMinutes);
      return;
    }
    
    // Fall back to direct implementation
    const item: CacheItem<T> = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching API data:', error);
  }
};

/**
 * Get cached API data if not expired
 */
export const getCachedApiData = async <T>(key: string): Promise<T | null> => {
  try {
    // Forward to existing cache function if possible for backward compatibility
    if (typeof getCachedPhotoData === 'function') {
      return getCachedPhotoData(key) as Promise<T | null>;
    }
    
    // Fall back to direct implementation
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const json = await AsyncStorage.getItem(cacheKey);
    
    if (!json) return null;
    
    const item = JSON.parse(json) as CacheItem<T>;
    
    if (Date.now() > item.expiry) {
      // Cache expired
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

/**
 * Remove a specific item from the cache
 */
export const removeCachedItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error('Error removing cached item:', error);
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear expired cache items
 */
export const clearExpiredCache = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX) && !key.includes('img_prefetched_'));
    let clearedCount = 0;
    
    // Check each key and remove if expired
    await Promise.all(
      cacheKeys.map(async (key) => {
        const json = await AsyncStorage.getItem(key);
        if (!json) return;
        
        const item = JSON.parse(json) as CacheItem<any>;
        if (Date.now() > item.expiry) {
          await AsyncStorage.removeItem(key);
          clearedCount++;
        }
      })
    );
    
    return clearedCount;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return 0;
  }
};