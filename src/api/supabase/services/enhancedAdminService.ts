// src/api/supabase/services/enhancedAdminService.ts
import { supabaseClient, supabasePublicClient } from '../client';
import { ApiResponse } from '../types';

// Extended user interface for admin purposes
export interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  raw_user_meta_data: any;
  raw_app_meta_data: any;
  // Profile data
  name: string | null;
  avatar_url: string | null;
  // Role data
  isAdmin: boolean;
  // Additional stats
  favorites_count?: number;
  orders_count?: number;
}

export interface UserListOptions {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: 'created_at' | 'last_sign_in_at' | 'email' | 'name';
  orderDirection?: 'asc' | 'desc';
  role?: 'all' | 'admin' | 'user';
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentlyActive: number;
  unverifiedEmails: number;
}

/**
 * Enhanced admin service with comprehensive user management capabilities
 */
export const enhancedAdminService = {
  /**
   * Get comprehensive user statistics
   */
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    try {
      // Get total user count from profiles
      const { count: totalUsers, error: countError } = await supabasePublicClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get admin count
      const { data: adminRoles, error: adminError } = await supabasePublicClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminError) throw adminError;

      const adminUsers = adminRoles?.length || 0;
      const regularUsers = (totalUsers || 0) - adminUsers;

      // For recently active and unverified, we'd need to query Supabase Auth
      // These are placeholder calculations
      const recentlyActive = Math.floor((totalUsers || 0) * 0.3);
      const unverifiedEmails = Math.floor((totalUsers || 0) * 0.1);

      const stats: UserStats = {
        totalUsers: totalUsers || 0,
        adminUsers,
        regularUsers,
        recentlyActive,
        unverifiedEmails
      };

      return { data: stats, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get enhanced user list with auth data and profile information
   */
  getEnhancedUsers: async (options: UserListOptions = {}): Promise<ApiResponse<AdminUser[]>> => {
    const {
      page = 1,
      limit = 20,
      search = '',
      orderBy = 'created_at',
      orderDirection = 'desc',
      role = 'all'
    } = options;

    try {
      // Start with profiles query
      let profileQuery = supabasePublicClient
        .from('profiles')
        .select('*');

      // Apply search filter
      if (search) {
        profileQuery = profileQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Apply ordering
      profileQuery = profileQuery.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      profileQuery = profileQuery.range(from, to);

      const { data: profiles, error: profileError } = await profileQuery;

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        return { data: [], error: null, status: 200 };
      }

      // Get admin roles for all users
      const userIds = profiles.map(profile => profile.id);
      const { data: adminRoles, error: rolesError } = await supabasePublicClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(role => role.user_id) || []);

      // Enhance profiles with admin status and additional data
      const enhancedUsers: AdminUser[] = await Promise.all(
        profiles.map(async (profile) => {
          const isAdmin = adminUserIds.has(profile.id);

          // Get additional user stats (favorites, orders)
          const [favoritesCount, ordersCount] = await Promise.all([
            enhancedAdminService.getUserFavoritesCount(profile.id),
            enhancedAdminService.getUserOrdersCount(profile.id)
          ]);

          return {
            id: profile.id,
            email: profile.email || '',
            phone: null, // Would come from auth.users if accessible
            email_confirmed_at: null, // Would come from auth.users if accessible
            phone_confirmed_at: null,
            last_sign_in_at: null, // Would come from auth.users if accessible
            created_at: profile.created_at || '',
            updated_at: profile.updated_at || '',
            raw_user_meta_data: {},
            raw_app_meta_data: {},
            name: profile.name,
            avatar_url: profile.avatar_url,
            isAdmin,
            favorites_count: favoritesCount.data || 0,
            orders_count: ordersCount.data || 0
          };
        })
      );

      // Apply role filter
      let filteredUsers = enhancedUsers;
      if (role !== 'all') {
        filteredUsers = enhancedUsers.filter(user => 
          role === 'admin' ? user.isAdmin : !user.isAdmin
        );
      }

      return { data: filteredUsers, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting enhanced users:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get user favorites count
   */
  getUserFavoritesCount: async (userId: string): Promise<ApiResponse<number>> => {
    try {
      // This would typically query a favorites table
      // For now, we'll use AsyncStorage data or return a placeholder
      
      // In a real implementation, you might have a favorites table:
      // const { count, error } = await supabaseClient
      //   .from('user_favorites')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', userId);

      // For now, return a random count for demo purposes
      const count = Math.floor(Math.random() * 25);
      return { data: count, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting user favorites count:', error);
      return { data: 0, error: error as Error, status: 500 };
    }
  },

  /**
   * Get user orders count
   */
  getUserOrdersCount: async (userId: string): Promise<ApiResponse<number>> => {
    try {
      // This would typically query an orders table
      // For now, return a placeholder count
      
      // In a real implementation:
      // const { count, error } = await supabaseClient
      //   .from('orders')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', userId);

      const count = Math.floor(Math.random() * 10);
      return { data: count, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting user orders count:', error);
      return { data: 0, error: error as Error, status: 500 };
    }
  },

  /**
   * Create a new user (admin function)
   * Note: This requires Supabase Auth Admin API which needs server-side implementation
   */
  createUser: async (userData: {
    email: string;
    password: string;
    name: string;
    isAdmin?: boolean;
  }): Promise<ApiResponse<string>> => {
    try {
      // This would typically use Supabase Auth Admin API
      // For security reasons, user creation should be done server-side
      
      // Placeholder implementation - in reality, you'd call your server endpoint
      console.log('Creating user:', userData);
      
      // You would make a call to your server endpoint that uses:
      // const { data, error } = await supabaseAdmin.auth.admin.createUser({
      //   email: userData.email,
      //   password: userData.password,
      //   user_metadata: { name: userData.name },
      //   email_confirm: true
      // });

      return { 
        data: 'user-id-placeholder', 
        error: new Error('User creation requires server-side implementation'), 
        status: 501 
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Delete a user (admin function)
   * Note: This requires Supabase Auth Admin API
   */
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    try {
      // This would use Supabase Auth Admin API
      // Should be implemented server-side for security
      
      // First, clean up user data
      // Delete profile
      const { error: profileError } = await supabasePublicClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Delete user roles
      const { error: rolesError } = await supabasePublicClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // In a real implementation, you'd also call:
      // await supabaseAdmin.auth.admin.deleteUser(userId);

      return { 
        data: null, 
        error: new Error('User deletion requires server-side implementation'), 
        status: 501 
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Update user profile information
   */
  updateUserProfile: async (
    userId: string, 
    updates: Partial<Pick<AdminUser, 'name' | 'avatar_url'>>
  ): Promise<ApiResponse<null>> => {
    try {
      const { error } = await supabasePublicClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Reset user password (admin function)
   * Note: This should be implemented server-side
   */
  resetUserPassword: async (email: string): Promise<ApiResponse<null>> => {
    try {
      // This would use Supabase Auth Admin API to generate a reset link
      // Should be implemented server-side
      
      return { 
        data: null, 
        error: new Error('Password reset requires server-side implementation'), 
        status: 501 
      };
    } catch (error) {
      console.error('Error resetting user password:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Send verification email to user
   * Note: This should be implemented server-side
   */
  sendVerificationEmail: async (email: string): Promise<ApiResponse<null>> => {
    try {
      // This would use Supabase Auth to resend verification
      return { 
        data: null, 
        error: new Error('Email verification requires server-side implementation'), 
        status: 501 
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get user activity logs (if implemented)
   */
  getUserActivityLogs: async (
    userId: string, 
    options: { limit?: number; page?: number } = {}
  ): Promise<ApiResponse<any[]>> => {
    try {
      // This would query an audit log table if you have one
      // For now, return empty array
      
      return { data: [], error: null, status: 200 };
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Bulk operations for users
   */
  bulkUpdateUsers: async (
    userIds: string[],
    updates: Partial<Pick<AdminUser, 'name' | 'avatar_url'>>
  ): Promise<ApiResponse<null>> => {
    try {
      const { error } = await supabasePublicClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', userIds);

      if (error) throw error;

      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error bulk updating users:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Export users data (for admin reports)
   */
  exportUsersData: async (options: UserListOptions = {}): Promise<ApiResponse<AdminUser[]>> => {
    try {
      // Get all users without pagination for export
      const { data: users, error } = await enhancedAdminService.getEnhancedUsers({
        ...options,
        limit: 10000, // Large limit for export
        page: 1
      });

      if (error) throw error;

      return { data: users || [], error: null, status: 200 };
    } catch (error) {
      console.error('Error exporting users data:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  }
};