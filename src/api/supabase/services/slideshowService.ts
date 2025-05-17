// src/api/supabase/services/slideshowService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { photoService } from '@/api/supabase';
import { Photo } from '@/api/supabase/types';

// Constants
const CACHE_KEY_PREFIX = 'slideshow_category_';
const AUTO_MODE_KEY_PREFIX = 'slideshow_auto_mode_';
const DEFAULT_MAX_SLIDES = 5;

// Types
interface SlideshowServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Service for handling slideshow categories
 */
export const slideshowService = {
  /**
   * Get photos for a specific category
   */
  getCategoryPhotos: async (category: string): Promise<SlideshowServiceResponse<string[]>> => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${category}`;
      const storedPhotos = await AsyncStorage.getItem(cacheKey);
      
      if (storedPhotos) {
        return {
          data: JSON.parse(storedPhotos),
          error: null
        };
      }
      
      return {
        data: [],
        error: null
      };
    } catch (error) {
      console.error(`Error getting photos for ${category}:`, error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Save photos for a specific category
   */
  saveCategoryPhotos: async (category: string, photos: string[]): Promise<SlideshowServiceResponse<null>> => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${category}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(photos));
      
      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error(`Error saving photos for ${category}:`, error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Get auto mode setting for a specific category
   */
  getAutoModeSetting: async (category: string): Promise<SlideshowServiceResponse<boolean>> => {
    try {
      const key = `${AUTO_MODE_KEY_PREFIX}${category}`;
      const storedSetting = await AsyncStorage.getItem(key);
      
      // If no setting has been saved, default to true for featured, new, and popular
      if (storedSetting === null) {
        const defaultSetting = category !== 'favorites';
        return {
          data: defaultSetting,
          error: null
        };
      }
      
      return {
        data: JSON.parse(storedSetting),
        error: null
      };
    } catch (error) {
      console.error(`Error getting auto mode setting for ${category}:`, error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Save auto mode setting for a specific category
   */
  saveAutoModeSetting: async (category: string, enabled: boolean): Promise<SlideshowServiceResponse<null>> => {
    try {
      const key = `${AUTO_MODE_KEY_PREFIX}${category}`;
      await AsyncStorage.setItem(key, JSON.stringify(enabled));
      
      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error(`Error saving auto mode setting for ${category}:`, error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Get slideshow photos - uses photos from the specified category
   * For backward compatibility, we still support the original functions
   */
  getAdminFavorites: async (): Promise<SlideshowServiceResponse<string[]>> => {
    return slideshowService.getCategoryPhotos('favorites');
  },
  
  saveAdminFavorites: async (favorites: string[]): Promise<SlideshowServiceResponse<null>> => {
    return slideshowService.saveCategoryPhotos('favorites', favorites);
  },
  
  /**
   * Get slideshow photos for a specific category
   * If auto mode is enabled for the category, this will fetch photos automatically
   */
  getSlideshowPhotos: async (
    userFavorites: string[] | null | undefined,
    maxSlides: number = DEFAULT_MAX_SLIDES,
    category: string = 'favorites'
  ): Promise<SlideshowServiceResponse<Photo[]>> => {
    try {
      // Check if auto mode is enabled for this category (except favorites which doesn't support auto mode)
      let useAutoMode = false;
      if (category !== 'favorites') {
        const { data: autoModeEnabled } = await slideshowService.getAutoModeSetting(category);
        useAutoMode = autoModeEnabled === true;
      }
      
      // If auto mode is enabled, fetch photos automatically
      if (useAutoMode) {
        return await slideshowService.getAutoPhotosForCategory(category, maxSlides);
      }
      
      // Otherwise, use manually selected photos
      
      // Determine which favorites to use
      let favoriteIds: string[] = [];
      
      // For the favorites category, use user favorites if available
      if (category === 'favorites') {
        if (userFavorites && userFavorites.length > 0) {
          // Use user favorites if available
          favoriteIds = userFavorites.slice(0, maxSlides);
        } else {
          // Fall back to admin favorites
          const { data: adminFavorites } = await slideshowService.getCategoryPhotos('favorites');
          
          if (adminFavorites && adminFavorites.length > 0) {
            favoriteIds = adminFavorites.slice(0, maxSlides);
          }
        }
      } else {
        // For other categories, just use the admin-defined photos
        const { data: categoryPhotos } = await slideshowService.getCategoryPhotos(category);
        
        if (categoryPhotos && categoryPhotos.length > 0) {
          // For non-favorites categories, we may only want one photo
          favoriteIds = category === 'favorites' 
            ? categoryPhotos.slice(0, maxSlides)
            : categoryPhotos.slice(0, 1); // Only take the first photo for other categories
        }
      }
      
      if (favoriteIds.length === 0) {
        return {
          data: [],
          error: null
        };
      }
      
      // Load each photo
      const photos: Photo[] = [];
      for (const id of favoriteIds) {
        try {
          const { data: photo } = await photoService.getPhotoById(id);
          if (photo) {
            photos.push(photo);
          }
        } catch (err) {
          console.error(`Error loading slide photo ${id}:`, err);
          // Continue with other photos even if one fails
        }
      }
      
      return {
        data: photos,
        error: null
      };
    } catch (error) {
      console.error('Error loading slideshow photos:', error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Get auto photos for a specific category
   * This is used when auto mode is enabled
   */
  getAutoPhotosForCategory: async (
    category: string,
    maxSlides: number = 1
  ): Promise<SlideshowServiceResponse<Photo[]>> => {
    try {
      let photos: Photo[] = [];
      
      // Different fetch strategy based on category
      switch (category) {
        case 'new':
          // Get most recent photos
          const { data: newPhotos } = await photoService.getCatalogPhotos({
            page: 1,
            limit: maxSlides,
            useCache: false // Ensure we get the latest
          });
          
          if (newPhotos && newPhotos.length > 0) {
            photos = newPhotos;
          }
          break;
          
        case 'popular':
          // In a real implementation, this would fetch photos sorted by popularity
          // For now, we'll simulate by getting photos from page 2
          const { data: popularPhotos } = await photoService.getCatalogPhotos({
            page: 2,
            limit: maxSlides
          });
          
          if (popularPhotos && popularPhotos.length > 0) {
            photos = popularPhotos;
          }
          break;
          
        case 'featured':
          // In a real implementation, this might use a specific tag or field
          // For now, we'll simulate by getting photos from a specific category
          const { data: featuredPhotos } = await photoService.getPhotosByCategory(
            'featured', // This assumes you have a 'featured' category
            { page: 1, limit: maxSlides }
          );
          
          if (featuredPhotos && featuredPhotos.length > 0) {
            photos = featuredPhotos;
          } else {
            // Fallback to getting the first few photos
            const { data: fallbackPhotos } = await photoService.getCatalogPhotos({
              page: 1,
              limit: maxSlides
            });
            
            if (fallbackPhotos && fallbackPhotos.length > 0) {
              photos = fallbackPhotos;
            }
          }
          break;
          
        default:
          // For any other category, just get the first few photos
          const { data: defaultPhotos } = await photoService.getCatalogPhotos({
            page: 1,
            limit: maxSlides
          });
          
          if (defaultPhotos && defaultPhotos.length > 0) {
            photos = defaultPhotos;
          }
      }
      
      return {
        data: photos,
        error: null
      };
    } catch (error) {
      console.error(`Error getting auto photos for ${category}:`, error);
      return {
        data: null,
        error: error as Error
      };
    }
  }
};

export default slideshowService;