// src/utils/imageCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

// Pre-load and cache images
export const prefetchImage = (uri: string): Promise<boolean> => {
  return Image.prefetch(uri)
    .then(() => {
      // Mark this URL as prefetched in AsyncStorage
      AsyncStorage.setItem(`img_prefetched_${uri}`, 'true');
      return true;
    })
    .catch(error => {
      console.error('Error prefetching image:', error);
      return false;
    });
};

// Cache API data
export const cacheApiData = async (key: string, data: any, expiryMinutes = 60): Promise<void> => {
  try {
    const item = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    await AsyncStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching API data:', error);
  }
};

// Get cached API data
export const getCachedApiData = async (key: string): Promise<any | null> => {
  try {
    const cacheKey = `api_cache_${key}`;
    const json = await AsyncStorage.getItem(cacheKey);
    if (!json) return null;
    
    const item = JSON.parse(json);
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