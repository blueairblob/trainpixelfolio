// src/api/supabase/services/userService.ts
import { supabaseClient } from '../client';
import { ApiResponse, UserProfile, ExtendedUserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for local storage
const GUEST_FAVORITES_KEY = 'guest-favorites';
const USER_FAVORITES_PREFIX = 'user-favorites-';

/**
 * Service for handling user-related operations
 */
export const userService = {
  /**
   * Get full user profile with additional info like favorites
   */
  getExtendedUserProfile: async (userId: string): Promise<ApiResponse<ExtendedUserProfile>> => {
    try {
      // First get the basic profile
      const { data: profile, error: profileError, status } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      if (!profile) {
        return { data: null, error: new Error('User profile not found'), status: 404 };
      }
      
      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabaseClient
        .rpc('is_admin', { user_id: userId });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }
      
      // Get favorites
      const { data: favorites } = await this.getFavorites({ userId });
      
      // Return extended profile
      const extendedProfile: ExtendedUserProfile = {
        ...profile as UserProfile,
        isAdmin: !!isAdmin,
        favorites: favorites || [],
        orders: [] // Could fetch orders here if you implement that feature
      };
      
      return { data: extendedProfile, error: null, status };
    } catch (error) {
      console.error('Error getting extended user profile:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Update user profile 
   */
  updateProfile: async (userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<null>> => {
    try {
      const { error, status } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      return { data: null, error: null, status };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Get user favorites
   */
  getFavorites: async (options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<string[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      if (isGuest) {
        // Get guest favorites from AsyncStorage
        const guestFavoritesJson = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        const favorites = guestFavoritesJson ? JSON.parse(guestFavoritesJson) : [];
        return { data: favorites, error: null, status: 200 };
      }
      
      if (!userId) {
        return { 
          data: null, 
          error: new Error('User ID is required for authenticated users'), 
          status: 400 
        };
      }
      
      // In future, this would fetch from a favorites table in the database
      // For now, use AsyncStorage for simplicity
      const favoritesJson = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      return { data: favorites, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting favorites:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Add to favorites
   */
  addToFavorites: async (photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<null>> => {
    const { userId, isGuest = false } = options;
    
    try {
      if (isGuest) {
        // Handle guest favorites with AsyncStorage
        const guestFavoritesJson = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        const favorites = guestFavoritesJson ? JSON.parse(guestFavoritesJson) : [];
        
        if (!favorites.includes(photoId)) {
          const updatedFavorites = [...favorites, photoId];
          await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
        }
        
        return { data: null, error: null, status: 200 };
      }
      
      if (!userId) {
        return { 
          data: null, 
          error: new Error('User ID is required for authenticated users'), 
          status: 400 
        };
      }
      
      // In future, this would insert into a favorites table in the database
      // For now, use AsyncStorage for simplicity
      const favoritesJson = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      if (!favorites.includes(photoId)) {
        const updatedFavorites = [...favorites, photoId];
        await AsyncStorage.setItem(`${USER_FAVORITES_PREFIX}${userId}`, JSON.stringify(updatedFavorites));
      }
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Remove from favorites
   */
  removeFromFavorites: async (photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<null>> => {
    const { userId, isGuest = false } = options;
    
    try {
      if (isGuest) {
        // Handle guest favorites with AsyncStorage
        const guestFavoritesJson = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        const favorites = guestFavoritesJson ? JSON.parse(guestFavoritesJson) : [];
        
        const updatedFavorites = favorites.filter((id: string) => id !== photoId);
        await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
        
        return { data: null, error: null, status: 200 };
      }
      
      if (!userId) {
        return { 
          data: null, 
          error: new Error('User ID is required for authenticated users'), 
          status: 400 
        };
      }
      
      // In future, this would delete from a favorites table in the database
      // For now, use AsyncStorage for simplicity
      const favoritesJson = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      const updatedFavorites = favorites.filter((id: string) => id !== photoId);
      await AsyncStorage.setItem(`${USER_FAVORITES_PREFIX}${userId}`, JSON.stringify(updatedFavorites));
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Check if a photo is in favorites
   */
  isFavorite: async (photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<boolean>> => {
    try {
      const { data: favorites } = await this.getFavorites(options);
      const isFavorite = favorites ? favorites.includes(photoId) : false;
      
      return { data: isFavorite, error: null, status: 200 };
    } catch (error) {
      console.error('Error checking if photo is favorite:', error);
      return { data: false, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Transfer guest favorites to user account
   */
  transferGuestFavorites: async (userId: string): Promise<ApiResponse<null>> => {
    try {
      // Get guest favorites
      const guestFavoritesJson = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
      const guestFavorites = guestFavoritesJson ? JSON.parse(guestFavoritesJson) : [];
      
      if (guestFavorites.length === 0) {
        return { data: null, error: null, status: 200 };
      }
      
      // Get user favorites
      const userFavoritesJson = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
      const userFavorites = userFavoritesJson ? JSON.parse(userFavoritesJson) : [];
      
      // Merge favorites (remove duplicates)
      const mergedFavorites = Array.from(new Set([...userFavorites, ...guestFavorites]));
      
      // Save merged favorites
      await AsyncStorage.setItem(`${USER_FAVORITES_PREFIX}${userId}`, JSON.stringify(mergedFavorites));
      
      // Clear guest favorites
      await AsyncStorage.removeItem(GUEST_FAVORITES_KEY);
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error transferring guest favorites:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  }
};