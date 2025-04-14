// src/api/supabase/services/userService.ts
import { supabaseClient, supabasePublicClient } from '../client';
import { 
  ApiResponse, 
  UserProfile, 
  ExtendedUserProfile,
  UserProfileInsert,
  UserProfileUpdate 
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for local storage
const GUEST_FAVORITES_KEY = 'guest-favorites';
const USER_FAVORITES_PREFIX = 'user-favorites-';

/**
 * Service for handling user-related operations
 */
const userService = {
  /**
   * Get user favorites
   */
  getFavorites: async function(options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<string[]>> {
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
   * Get full user profile with additional info like favorites
   */
  getExtendedUserProfile: async function(userId: string): Promise<ApiResponse<ExtendedUserProfile>> {
    try {
      // First try to get the basic profile from public schema
      const { data: profile, error: profileError } = await supabasePublicClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single
      
      console.log("Profile query result:", profile ? "found" : "not found", profileError ? "error" : "no error");
      
      // If no profile exists, create one
      if (!profile && !profileError) {
        console.log("Creating new profile for user:", userId);
        // Get user data from auth
        const { data: userData } = await supabaseClient.auth.getUser();
        
        if (userData?.user) {
          // Create a basic profile
          const newProfile: UserProfileInsert = {
            id: userId,
            name: userData.user.user_metadata?.name || 'User',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("Inserting new profile:", newProfile);
          
          // Insert the new profile using public schema client
          const { data: insertedProfile, error: insertError } = await supabasePublicClient
            .from('profiles')
            .upsert(newProfile)
            .select()
            .single();
          
          if (insertError) {
            console.error("Error inserting profile:", insertError);
            throw insertError;
          }
          
          // Use the newly created profile
          if (insertedProfile) {
            console.log("Profile inserted successfully");
            // Check if user is admin - use public schema client
            const { data: isAdmin, error: adminError } = await supabasePublicClient
              .rpc('is_admin', { user_id: userId });
            
            if (adminError) {
              console.error('Error checking admin status:', adminError);
            }
            
            // Instead of calling this.getFavorites, call the function directly
            console.log("About to get favorites for newly created profile");
            const favorites = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
            const parsedFavorites = favorites ? JSON.parse(favorites) : [];
            
            // Return extended profile
            const extendedProfile: ExtendedUserProfile = {
              ...insertedProfile as UserProfile,
              isAdmin: !!isAdmin,
              favorites: parsedFavorites,
              orders: [] // Could fetch orders here if you implement that feature
            };
            
            return { data: extendedProfile, error: null, status: 200 };
          }
        }
        
        return { data: null, error: new Error('Failed to create user profile'), status: 500 };
      }
      
      if (profileError) {
        console.error("Profile query error:", profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.log("No profile found for user:", userId);
        return { data: null, error: new Error('User profile not found'), status: 404 };
      }
      
      console.log("Found existing profile, checking admin status");
      // Check if user is admin - use public schema client for rpc function
      const { data: isAdmin, error: adminError } = await supabasePublicClient
        .rpc('is_admin', { user_id: userId });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }
      
      // Instead of calling this.getFavorites, get the favorites directly
      console.log("Getting favorites for existing profile");
      const favorites = await AsyncStorage.getItem(`${USER_FAVORITES_PREFIX}${userId}`);
      const parsedFavorites = favorites ? JSON.parse(favorites) : [];
      
      // Return extended profile
      const extendedProfile: ExtendedUserProfile = {
        ...profile as UserProfile,
        isAdmin: !!isAdmin,
        favorites: parsedFavorites,
        orders: [] // Could fetch orders here if you implement that feature
      };
      
      return { data: extendedProfile, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting extended user profile:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Update user profile 
   */
  updateProfile: async function(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<null>> {
    try {
      console.log("Updating profile for user:", userId, "with data:", updates);
      
      // Ensure the updated_at field is set
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Use public schema client for profiles table
      const { error, status, data } = await supabasePublicClient
        .from('profiles')
        .update(updatesWithTimestamp)
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error("Profile update failed with error:", error);
        throw error;
      }
      
      console.log("Profile update successful, response:", data);
      return { data: null, error: null, status };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Add to favorites
   */
  addToFavorites: async function(photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<null>> {
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
  removeFromFavorites: async function(photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<null>> {
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
  isFavorite: async function(photoId: string, options: { 
    userId?: string; 
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<boolean>> {
    try {
      // Call getFavorites directly as a method on this object
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
  transferGuestFavorites: async function(userId: string): Promise<ApiResponse<null>> {
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

// Export the service
export { userService };