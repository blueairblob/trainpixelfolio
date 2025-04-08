
// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  isGuest: boolean;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  addFavorite: (photoId: string) => Promise<void>;
  removeFavorite: (photoId: string) => Promise<void>;
  getFavorites: () => Promise<string[]>;
};

export type UserProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  email?: string | null;
  orders: any[];
  favorites: string[];
};

const GUEST_FAVORITES_KEY = 'guest_favorites';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserProfile(data as UserProfile);
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .rpc('is_admin', { user_id: userId });

      if (roleError) throw roleError;

      setIsAdmin(roleData || false);

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Load guest favorites from AsyncStorage
  const loadGuestFavorites = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error loading guest favorites:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);

        if (currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
          // If user logs in, disable guest mode
          setIsGuest(false);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", !!currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);

      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }

      setIsLoading(false);
    });

    // Check if guest mode was previously enabled
    AsyncStorage.getItem('guestMode').then((value) => {
      if (value === 'true' && !isAuthenticated) {
        enableGuestMode();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log("Login successful:", data);
      
      // Disable guest mode when user logs in
      setIsGuest(false);
      await AsyncStorage.removeItem('guestMode');
      
      return data;
    } catch (error: any) {
      console.error('Error during login:', error);
      Alert.alert("Login Error", error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;

      console.log("Registration successful:", data);

      // Disable guest mode when user registers
      setIsGuest(false);
      await AsyncStorage.removeItem('guestMode');

      // If email confirmation is required
      if (data?.user && !data.user.confirmed_at) {
        Alert.alert(
          "Verification Required",
          "Please check your email for a verification link to complete your registration."
        );
      }

      return data;
    } catch (error: any) {
      console.error('Error during registration:', error);
      Alert.alert("Registration Error", error.message);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
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
      // Use type assertion to make TypeScript happy with our schema
      const { error } = await supabase
        .from('profiles')
        .update(profileData as any)
        .eq('id', user!.id as any);
      
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) throw signInError;

      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("Logout successful");
      
      // Reset guest mode when logging out
      setIsGuest(false);
      await AsyncStorage.removeItem('guestMode');
    } catch (error: any) {
      console.error('Error during logout:', error);
      Alert.alert("Logout Error", error.message);
      throw error;
    }
  };
  
  const enableGuestMode = async () => {
    setIsGuest(true);
    console.log("Guest mode enabled");
    
    // Save guest mode state
    await AsyncStorage.setItem('guestMode', 'true');
    
    // Load any previously stored favorites
    const guestFavorites = await loadGuestFavorites();
    
    // Create a guest user profile with limited access
    setUserProfile({
      id: 'guest',
      name: 'Guest User',
      avatar_url: null,
      created_at: null,
      updated_at: null,
      orders: [],
      favorites: guestFavorites
    });
  };
  
  const disableGuestMode = async () => {
    setIsGuest(false);
    setUserProfile(null);
    console.log("Guest mode disabled");
    
    // Clear guest mode state
    await AsyncStorage.removeItem('guestMode');
  };

  // Add a photo to favorites
  const addFavorite = async (photoId: string) => {
    try {
      if (isGuest) {
        // Handle guest favorites with AsyncStorage
        const favorites = await loadGuestFavorites();
        if (!favorites.includes(photoId)) {
          const updatedFavorites = [...favorites, photoId];
          await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
          
          // Update local state
          setUserProfile(prev => 
            prev ? { ...prev, favorites: updatedFavorites } : null
          );
        }
        return;
      }
      
      if (!user) {
        Alert.alert("Error", "You must be logged in to add favorites");
        return;
      }
      
      // Handle authenticated user favorites in database
      // Implementation depends on your database schema
      // This is a placeholder - you'll need to implement based on your DB structure
      
      // Refresh profile after adding favorite
      await refreshProfile();
      
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
        // Handle guest favorites with AsyncStorage
        const favorites = await loadGuestFavorites();
        const updatedFavorites = favorites.filter((id: string) => id !== photoId);
        await AsyncStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
        
        // Update local state
        setUserProfile(prev => 
          prev ? { ...prev, favorites: updatedFavorites } : null
        );
        return;
      }
      
      if (!user) {
        Alert.alert("Error", "You must be logged in to remove favorites");
        return;
      }
      
      // Handle authenticated user favorites in database
      // Implementation depends on your database schema
      // This is a placeholder - you'll need to implement based on your DB structure
      
      // Refresh profile after removing favorite
      await refreshProfile();
      
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
        return await loadGuestFavorites();
      }
      
      if (!user || !userProfile) {
        return [];
      }
      
      return userProfile.favorites || [];
      
    } catch (error: any) {
      console.error('Error getting favorites:', error);
      return [];
    }
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
        getFavorites
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
