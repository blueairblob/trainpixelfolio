// src/api/supabase/services/authService.ts
import { supabaseClient } from '../client';
import { 
  AuthResponse, 
  ApiResponse, 
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate 
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_MODE_KEY = 'guestMode';

/**
 * Service for handling authentication with Supabase
 */
export const authService = {
  /**
   * Get the current session
   */
  getSession: async () => {
    return await supabaseClient.auth.getSession();
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        session: data.session,
        user: data.user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        session: null,
        user: null,
        error: error as Error
      };
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        throw error;
      }

      // If signUp is successful but email confirmation is required,
      // we need to create a profile for the user
      if (data.user && !data.session) {
        // Create profile in the profiles table
        const profileData: UserProfileInsert = {
          id: data.user.id,
          name,
          email
        };

        const { error: profileError } = await supabaseClient
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {
        session: data.session,
        user: data.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        session: null,
        user: null,
        error: error as Error
      };
    }
  },

  /**
   * Sign out
   */
  signOut: async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Update user
   */
  updateUser: async (updates: { email?: string; password?: string; data?: any }): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser(updates);
      
      if (error) {
        throw error;
      }

      return {
        session: null,
        user: data.user
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        session: null,
        user: null,
        error: error as Error
      };
    }
  },

  /**
   * Check if user is admin
   */
  isAdmin: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabaseClient.rpc('is_admin', { user_id: userId });
      
      if (error) {
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  },

  /**
   * Get user profile from database
   */
  getUserProfile: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    try {
      const { data, error, status } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return { 
        data: data as UserProfile, 
        error: null, 
        status 
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { 
        data: null, 
        error: error as Error, 
        status: 500 
      };
    }
  },
  
  /**
   * Update user profile in database
   */
  updateUserProfile: async (userId: string, updates: UserProfileUpdate): Promise<ApiResponse<null>> => {
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
      return { 
        data: null, 
        error: error as Error, 
        status: 500 
      };
    }
  },

  /**
   * Handle guest mode (using AsyncStorage)
   */
  enableGuestMode: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
    } catch (error) {
      console.error('Enable guest mode error:', error);
      throw error;
    }
  },

  disableGuestMode: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
    } catch (error) {
      console.error('Disable guest mode error:', error);
      throw error;
    }
  },

  isGuestMode: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(GUEST_MODE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Check guest mode error:', error);
      return false;
    }
  }
};