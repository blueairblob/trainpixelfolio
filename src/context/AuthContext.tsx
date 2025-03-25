// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export type UserProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  orders: any[];
  favorites: any[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .schema('public')
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
        .schema('public')
        .rpc('is_admin', { user_id: userId });

      if (roleError) throw roleError;

      setIsAdmin(roleData || false);

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
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
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
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
    } catch (error: any) {
      console.error('Error during logout:', error);
      Alert.alert("Logout Error", error.message);
      throw error;
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
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile
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
