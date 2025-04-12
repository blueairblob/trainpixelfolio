// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Import the Supabase services
import { authService, userService, supabaseClient } from '@/api/supabase';
import { ExtendedUserProfile } from '@/api/supabase/types';
import { supabase } from '@/services/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  userProfile: ExtendedUserProfile | null;
  isGuest: boolean;
  enableGuestMode: () => Promise<void>;
  disableGuestMode: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<ExtendedUserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  addFavorite: (photoId: string) => Promise<void>;
  removeFavorite: (photoId: string) => Promise<void>;
  getFavorites: () => Promise<string[]>;
  isFavorite: (photoId: string) => boolean;
};

const GUEST_FAVORITES_KEY = 'guest_favorites';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Fetch user profile from the Supabase database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await userService.getExtendedUserProfile(userId);
      
      if (error) throw error;
      
      if (profile) {
        setUserProfile(profile);
        setIsAdmin(profile.isAdmin);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Set up auth state listener for Supabase
  useEffect(() => {
    // Check if guest mode was previously enabled
    const checkGuestMode = async () => {
      const isGuestMode = await authService.isGuestMode();
      if (isGuestMode && !isAuthenticated) {
        await setupGuestProfile();
      }
    };

    const setupAuthListener = async () => {
      // Get the current session 
      const { data } = await authService.getSession();
      const currentSession = data.session;
      
      // Set up the auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log("Auth state changed:", event);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsAuthenticated(!!newSession);

          if (newSession?.user) {
            await fetchUserProfile(newSession.user.id);
            // If user logs in, disable guest mode
            setIsGuest(false);
            await authService.disableGuestMode();
          } else {
            setUserProfile(null);
            setIsAdmin(false);
            // Check if we should enable guest mode
            await checkGuestMode();
          }
          
          setIsLoading(false);
        }
      );

      // Set initial state
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
      } else {
        // Check if we should enable guest mode
        await checkGuestMode();
        setIsLoading(false);
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, []);

  // Set up guest profile
  const setupGuestProfile = async () => {
    try {
      // Get guest favorites from storage
      const guestFavorites = await loadGuestFavorites();

      // Create a guest profile
      const guestProfile: ExtendedUserProfile = {
        id: 'guest',
        name: 'Guest User',
        avatar_url: null,
        created_at: null,
        updated_at: null,
        favorites: guestFavorites,
        isAdmin: false,
        orders: []
      };

      setUserProfile(guestProfile);
      setIsGuest(true);
      setIsAuthenticated(true);
      setIsAdmin(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting up guest profile:', error);
    }
  };

  // Load guest favorites from AsyncStorage
  const loadGuestFavorites = async () => {
    try {
      const { data } = await userService.getFavorites({ isGuest: true });
      return data || [];
    } catch (error) {
      console.error('Error loading guest favorites:', error);
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user, session, error } = await authService.signIn(email, password);
      
      if (error) throw error;
      
      // If guest had favorites, transfer them to user account
      if (isGuest && user) {
        await userService.transferGuestFavorites(user.id);
      }
      
      return { user, session };
    } catch (error: any) {
      console.error('Error during login:', error);
      Alert.alert("Login Error", error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user, session, error } = await authService.signUp(name, email, password);
      
      if (error) throw error;
      
      // If email confirmation is required
      if (user && !session) {
        Alert.alert(
          "Verification Required",
          "Please check your email for a verification link to complete your registration."
        );
      }
      
      return { user, session };
    } catch (error: any) {
      console.error('Error during registration:', error);
      Alert.alert("Registration Error", error.message);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<ExtendedUserProfile>) => {
    if (!user && !isGuest) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    try {
      if (isGuest) {
        // Update local guest profile
        setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
        Alert.alert("Success", "Profile updated successfully");
        return;
      }

      // Update authenticated user profile in Supabase
      const { error } = await userService.updateProfile(user!.id, profileData);
      
      if (error) throw error;

      // Refresh profile data
      await refreshProfile();

      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert("Profile Update Error", error.message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) {
      Alert.alert("Error", "You must be logged in to change your password");
      return;
    }

    try {
      // First verify the current password by signing in
      const { error: signInError } = await authService.signIn(user.email, currentPassword);

      if (signInError) throw signInError;

      // Then update the password
      const { error } = await authService.updateUser({ password: newPassword });

      if (error) throw error;

      Alert.alert("Success", "Password changed successfully");
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert("Password Change Error", error.message);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    await fetchUserProfile(user.id);
  };

  const logout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;

      console.log("Logout successful");
      
      // Reset guest mode when logging out
      setIsGuest(false);
      await authService.disableGuestMode();
    } catch (error: any) {
      console.error('Error during logout:', error);
      Alert.alert("Logout Error", error.message);
      throw error;
    }
  };
  
  const enableGuestMode = async () => {
    await authService.enableGuestMode();
    setIsGuest(true);
    console.log("Guest mode enabled");
    
    // Load any previously stored favorites and set up guest profile
    await setupGuestProfile();
  };
  
  const disableGuestMode = async () => {
    await authService.disableGuestMode();
    setIsGuest(false);
    setUserProfile(null);
    setIsAuthenticated(false);
    console.log("Guest mode disabled");
  };

  // Add a photo to favorites
  const addFavorite = async (photoId: string) => {
    try {
      if (isGuest) {
        // Use userService for guest favorites
        await userService.addToFavorites(photoId, { isGuest: true });
      } else if (user) {
        // Use userService for authenticated user favorites
        await userService.addToFavorites(photoId, { userId: user.id });
      } else {
        throw new Error("User must be authenticated or in guest mode");
      }
      
      // Update local state
      setUserProfile(prev => {
        if (!prev) return null;
        const updatedFavorites = [...prev.favorites, photoId];
        return { ...prev, favorites: updatedFavorites };
      });
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      Alert.alert("Error", "Failed to add to favorites");
      throw error;
    }
  };
  
  // Remove a photo from favorites
  const removeFavorite = async (photoId: string) => {
    try {
      if (isGuest) {
        // Use userService for guest favorites
        await userService.removeFromFavorites(photoId, { isGuest: true });
      } else if (user) {
        // Use userService for authenticated user favorites
        await userService.removeFromFavorites(photoId, { userId: user.id });
      } else {
        throw new Error("User must be authenticated or in guest mode");
      }
      
      // Update local state
      setUserProfile(prev => {
        if (!prev) return null;
        const updatedFavorites = prev.favorites.filter(id => id !== photoId);
        return { ...prev, favorites: updatedFavorites };
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      Alert.alert("Error", "Failed to remove from favorites");
      throw error;
    }
  };
  
  // Get user favorites
  const getFavorites = async (): Promise<string[]> => {
    try {
      if (isGuest) {
        const { data } = await userService.getFavorites({ isGuest: true });
        return data || [];
      }
      
      if (!user || !userProfile) {
        return [];
      }
      
      const { data } = await userService.getFavorites({ userId: user.id });
      return data || [];
      
    } catch (error: any) {
      console.error('Error getting favorites:', error);
      return [];
    }
  };

  // Check if a photo is in favorites
  const isFavorite = (photoId: string): boolean => {
    if (!userProfile) return false;
    return userProfile.favorites.includes(photoId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        isAdmin,
        userProfile,
        isGuest,
        enableGuestMode,
        disableGuestMode,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile,
        addFavorite,
        removeFavorite,
        getFavorites,
        isFavorite
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};