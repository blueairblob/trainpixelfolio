// src/context/AuthContext.tsx - Updated with feature flags
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/api/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES, mustUseGuestMode, canShowAuth } from '@/config/features';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  favorites?: string[];
  orders?: any[];
}

interface AuthContextType {
  // User state
  isAuthenticated: boolean;
  isGuest: boolean;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Auth methods (may be disabled by feature flags)
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  
  // Guest mode methods
  enableGuestMode: () => Promise<void>;
  disableGuestMode: () => Promise<void>;
  
  // Favorites management
  addFavorite: (photoId: string) => Promise<void>;
  removeFavorite: (photoId: string) => Promise<void>;
  isFavorite: (photoId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  // Check if user is authenticated (not guest)
  const isAuthenticated = !isGuest && userProfile !== null;
  
  // Check admin status
  const isAdmin = isAuthenticated && FEATURES.ENABLE_ADMIN_PANEL && 
    userProfile?.email?.includes('admin'); // Simplified admin check

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // If forced guest mode is enabled, automatically set guest mode
      if (mustUseGuestMode()) {
        console.log('Forced guest mode enabled');
        await enableGuestMode();
        return;
      }
      
      // If authentication is disabled, force guest mode
      if (!canShowAuth()) {
        console.log('Authentication disabled, forcing guest mode');
        await enableGuestMode();
        return;
      }
      
      // Check if we're in guest mode
      const isGuestMode = await authService.isGuestMode();
      if (isGuestMode) {
        setIsGuest(true);
        await loadGuestProfile();
        return;
      }
      
      // Try to get existing session (only if auth is enabled)
      const { data: session } = await authService.getSession();
      if (session?.session && session.user) {
        await loadUserProfile(session.user.id);
      } else {
        // No session, redirect to guest mode if auth is disabled
        if (!canShowAuth()) {
          await enableGuestMode();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Fallback to guest mode on any error
      await enableGuestMode();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Only load profile if authentication is enabled
      if (!canShowAuth()) {
        return;
      }
      
      const { data: profile, error } = await authService.getUserProfile(userId);
      if (error) throw error;
      
      if (profile) {
        // Load favorites from AsyncStorage for the profile
        const favorites = await loadFavoritesFromStorage(userId);
        setUserProfile({
          ...profile,
          favorites: favorites || []
        });
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to guest mode
      await enableGuestMode();
    }
  };

  const loadGuestProfile = async () => {
    try {
      // Create a guest profile
      const guestId = 'guest_user';
      const favorites = await loadFavoritesFromStorage(guestId);
      
      setUserProfile({
        id: guestId,
        name: 'Guest User',
        email: 'guest@picaloco.app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        favorites: favorites || []
      });
      setIsGuest(true);
    } catch (error) {
      console.error('Error loading guest profile:', error);
    }
  };

  const loadFavoritesFromStorage = async (userId: string): Promise<string[]> => {
    try {
      const favoritesJson = await AsyncStorage.getItem(`favorites_${userId}`);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  };

  const saveFavoritesToStorage = async (userId: string, favorites: string[]) => {
    try {
      await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Auth methods (disabled if feature flags are off)
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!canShowAuth()) {
      console.log('Login disabled by feature flag');
      return false;
    }
    
    try {
      const { session, user, error } = await authService.signIn(email, password);
      if (error) throw error;
      
      if (user) {
        await loadUserProfile(user.id);
        await disableGuestMode();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (!canShowAuth()) {
      throw new Error('Registration is not available in this version');
    }
    
    try {
      const { user, error } = await authService.signUp(name, email, password);
      if (error) throw error;
      
      if (user) {
        // Don't automatically log in, let them verify email first
        console.log('User registered successfully');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isAuthenticated) {
        await authService.signOut();
      }
      
      // Switch to guest mode instead of completely logging out
      await enableGuestMode();
    } catch (error) {
      console.error('Logout error:', error);
      // Still switch to guest mode even if logout fails
      await enableGuestMode();
    }
  };

  const updateProfile = async (updates: any): Promise<void> => {
    if (!isAuthenticated || !userProfile) {
      throw new Error('No authenticated user to update');
    }
    
    try {
      const { error } = await authService.updateUserProfile(userProfile.id, updates);
      if (error) throw error;
      
      // Update local profile
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const enableGuestMode = async (): Promise<void> => {
    try {
      await authService.enableGuestMode();
      await loadGuestProfile();
    } catch (error) {
      console.error('Enable guest mode error:', error);
      // Create minimal guest profile even if storage fails
      setUserProfile({
        id: 'guest_user',
        name: 'Guest User',
        email: 'guest@picaloco.app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        favorites: []
      });
      setIsGuest(true);
    }
  };

  const disableGuestMode = async (): Promise<void> => {
    if (!canShowAuth()) {
      console.log('Cannot disable guest mode - authentication is disabled');
      return;
    }
    
    try {
      await authService.disableGuestMode();
      setIsGuest(false);
    } catch (error) {
      console.error('Disable guest mode error:', error);
    }
  };

  // Favorites management (works for both guest and authenticated users)
  const addFavorite = async (photoId: string): Promise<void> => {
    if (!userProfile) return;
    
    try {
      const currentFavorites = userProfile.favorites || [];
      if (currentFavorites.includes(photoId)) return;
      
      const newFavorites = [...currentFavorites, photoId];
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, favorites: newFavorites } : null);
      
      // Save to AsyncStorage
      await saveFavoritesToStorage(userProfile.id, newFavorites);
      
      // If authenticated and auth is enabled, also save to database
      if (isAuthenticated && canShowAuth()) {
        try {
          await authService.updateUserProfile(userProfile.id, { 
            favorites: newFavorites 
          });
        } catch (error) {
          console.error('Error syncing favorites to server:', error);
          // Don't throw - local storage is still updated
        }
      }
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  };

  const removeFavorite = async (photoId: string): Promise<void> => {
    if (!userProfile) return;
    
    try {
      const currentFavorites = userProfile.favorites || [];
      const newFavorites = currentFavorites.filter(id => id !== photoId);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, favorites: newFavorites } : null);
      
      // Save to AsyncStorage
      await saveFavoritesToStorage(userProfile.id, newFavorites);
      
      // If authenticated and auth is enabled, also save to database
      if (isAuthenticated && canShowAuth()) {
        try {
          await authService.updateUserProfile(userProfile.id, { 
            favorites: newFavorites 
          });
        } catch (error) {
          console.error('Error syncing favorites to server:', error);
          // Don't throw - local storage is still updated
        }
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
      throw error;
    }
  };

  const isFavorite = (photoId: string): boolean => {
    return userProfile?.favorites?.includes(photoId) || false;
  };

  const value: AuthContextType = {
    isAuthenticated,
    isGuest,
    userProfile,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    enableGuestMode,
    disableGuestMode,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};