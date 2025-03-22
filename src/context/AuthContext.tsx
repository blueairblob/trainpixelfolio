
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('userToken');
        
        if (userJson && token) {
          setUser(JSON.parse(userJson));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData.user));
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userRole', userData.user.role);
      
      setUser(userData.user);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const userData = await authService.register(name, email, password);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData.user));
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userRole', userData.user.role);
      
      setUser(userData.user);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove user data from storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
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
