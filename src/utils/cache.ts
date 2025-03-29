// src/utils/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache photo data with expiry
export const cachePhotoData = async (key: string, data: any, expiryMinutes = 60) => {
  try {
    const item = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Get cached photo data if not expired
export const getCachedPhotoData = async (key: string) => {
  try {
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    
    const item = JSON.parse(json);
    if (Date.now() > item.expiry) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};