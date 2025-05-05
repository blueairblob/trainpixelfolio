// src/services/slideshowService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { photoService } from '@/api/supabase';
import { Photo } from '@/api/supabase/types';

// Constants
const ADMIN_FAVORITES_KEY = 'admin_default_favorites';
const DEFAULT_MAX_SLIDES = 5;

// Types
interface SlideshowServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Service for handling slideshow favorites
 */
export const slideshowService = {
  /**
   * Get admin default favorites
   */
  getAdminFavorites: async (): Promise<SlideshowServiceResponse<string[]>> => {
    try {
      const storedFavorites = await AsyncStorage.getItem(ADMIN_FAVORITES_KEY);
      
      if (storedFavorites) {
        return {
          data: JSON.parse(storedFavorites),
          error: null
        };
      }
      
      return {
        data: [],
        error: null
      };
    } catch (error) {
      console.error('Error getting admin favorites:', error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Save admin default favorites
   */
  saveAdminFavorites: async (favorites: string[]): Promise<SlideshowServiceResponse<null>> => {
    try {
      await AsyncStorage.setItem(ADMIN_FAVORITES_KEY, JSON.stringify(favorites));
      
      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error('Error saving admin favorites:', error);
      return {
        data: null,
        error: error as Error
      };
    }
  },
  
  /**
   * Get slideshow photos - uses user favorites if available, otherwise admin defaults
   */
  getSlideshowPhotos: async (
    userFavorites: string[] | null | undefined,
    maxSlides: number = DEFAULT_MAX_SLIDES
  ): Promise<SlideshowServiceResponse<Photo[]>> => {
    try {
      // Determine which favorites to use
      let favoriteIds: string[] = [];
      
      if (userFavorites && userFavorites.length > 0) {
        // Use user favorites if available
        favoriteIds = userFavorites.slice(0, maxSlides);
        console.log(`Using ${favoriteIds.length} user favorites for slideshow`);
      } else {
        // Fall back to admin favorites
        const { data: adminFavorites } = await slideshowService.getAdminFavorites();
        
        if (adminFavorites && adminFavorites.length > 0) {
          favoriteIds = adminFavorites.slice(0, maxSlides);
          console.log(`Using ${favoriteIds.length} admin favorites for slideshow`);
        } else {
          // No favorites defined at all
          return {
            data: [],
            error: null
          };
        }
      }
      
      if (favoriteIds.length === 0) {
        return {
          data: [],
          error: null
        };
      }
      
      // Load each favorite photo
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