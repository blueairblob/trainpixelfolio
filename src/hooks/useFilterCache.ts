// src/hooks/useFilterCache.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCachedFilterOptions,
  clearFilterCache,
  clearAllFilterCaches,
  getFilterCacheAge
} from '@/utils/filterCache';

// Types for cache status
interface CacheStatus {
  exists: boolean;
  age: number | null; // Age in seconds
  lastUpdated: string | null;
}

interface UseFilterCacheReturn {
  isCacheAvailable: boolean;
  cacheStatus: Record<string, CacheStatus>;
  clearAllCaches: () => Promise<void>;
  clearCache: (key: string) => Promise<void>;
  refreshCacheStatus: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Hook to manage and monitor filter option caches
 * 
 * @param cacheKeys Object with cache keys to monitor
 * @returns Object with cache status and management functions
 */
export const useFilterCache = (
  cacheKeys: Record<string, string>
): UseFilterCacheReturn => {
  const [cacheStatus, setCacheStatus] = useState<Record<string, CacheStatus>>({});
  const [isCacheAvailable, setIsCacheAvailable] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Check if cache is available and get status for all keys
  const refreshCacheStatus = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const statuses: Record<string, CacheStatus> = {};
      let hasAnyCache = false;
      
      // Check each cache key
      for (const [name, key] of Object.entries(cacheKeys)) {
        const cacheKey = `filter_cache_${key}`;
        
        // Check if cache exists
        const cacheData = await AsyncStorage.getItem(cacheKey);
        const exists = !!cacheData;
        
        // Get cache age if exists
        let age: number | null = null;
        let lastUpdated: string | null = null;
        
        if (exists) {
          hasAnyCache = true;
          age = await getFilterCacheAge(key);
          
          if (cacheData) {
            const parsed = JSON.parse(cacheData);
            if (parsed && parsed.timestamp) {
              lastUpdated = new Date(parsed.timestamp).toLocaleString();
            }
          }
        }
        
        statuses[name] = { exists, age, lastUpdated };
      }
      
      setCacheStatus(statuses);
      setIsCacheAvailable(hasAnyCache);
    } catch (error) {
      console.error('Error checking filter cache status:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKeys]);
  
  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await clearAllFilterCaches();
      // Refresh cache status
      await refreshCacheStatus();
    } catch (error) {
      console.error('Error clearing all filter caches:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCacheStatus]);
  
  // Clear specific cache
  const clearCache = useCallback(async (key: string) => {
    setIsRefreshing(true);
    try {
      // Find the actual cache key value from the key name
      const cacheKey = Object.entries(cacheKeys).find(([name]) => name === key)?.[1];
      
      if (cacheKey) {
        await clearFilterCache(cacheKey);
        // Refresh cache status
        await refreshCacheStatus();
      } else {
        console.error(`Cache key not found: ${key}`);
      }
    } catch (error) {
      console.error(`Error clearing filter cache for ${key}:`, error);
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKeys, refreshCacheStatus]);
  
  // Check cache status on mount
  useEffect(() => {
    refreshCacheStatus();
  }, [refreshCacheStatus]);
  
  return {
    isCacheAvailable,
    cacheStatus,
    clearAllCaches,
    clearCache,
    refreshCacheStatus,
    isRefreshing
  };
};

export default useFilterCache;