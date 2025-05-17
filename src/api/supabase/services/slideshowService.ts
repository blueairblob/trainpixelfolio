// src/api/supabase/services/slideshowService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { photoService } from '@/api/supabase';
import { Photo } from '@/api/supabase/types';

// Constants
const CACHE_KEY_PREFIX = 'slideshow_category_';
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
   */
  getSlideshowPhotos: async (
    userFavorites: string[] | null | undefined,
    maxSlides: number = DEFAULT_MAX_SLIDES,
    category: string = 'favorites'
  ): Promise<SlideshowServiceResponse<Photo[]>> => {
    try {
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
  }
};

export default slideshowService;