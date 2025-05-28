// src/api/supabase/services/clientUserManagementService.ts
import { supabaseClient } from '../client';
import { ApiResponse } from '../types';

// Your server API base URL
const SERVER_API_BASE = process.env.EXPO_PUBLIC_SERVER_API_URL || 'https://your-server.com/api';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  isAdmin?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface UserListOptions {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  role?: 'all' | 'admin' | 'user';
}

/**
 * Client-side service for user management operations
 * This service interfaces with your server API for secure operations
 */
export const clientUserManagementService = {
  /**
   * Get the current user's auth token for API requests
   */
  async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token || null;
  },

  /**
   * Make authenticated API request to your server
   */
  async makeAuthenticatedRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${SERVER_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  },

  /**
   * Create a new user (Admin only)
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<string>> {
    try {
      const response = await this.makeAuthenticatedRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: result.userId, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Delete a user (Admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.makeAuthenticatedRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: null, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Update user information (Admin only)
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<ApiResponse<null>> {
    try {
      const response = await this.makeAuthenticatedRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: null, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get all users with pagination and filtering (Admin only)
   */
  async getAllUsers(options: UserListOptions = {}): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.makeAuthenticatedRequest(
        `/admin/users?${queryParams.toString()}`
      );

      const result = await response.json();
      
      if (result.success) {
        return { data: result.users, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get detailed user information (Admin only)
   */
  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeAuthenticatedRequest(`/admin/users/${userId}`);

      const result = await response.json();
      
      if (result.success) {
        return { data: result.user, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Toggle admin role for a user (Admin only)
   */
  async toggleAdminRole(userId: string, makeAdmin: boolean): Promise<ApiResponse<null>> {
    try {
      const response = await this.makeAuthenticatedRequest(`/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        body: JSON.stringify({ makeAdmin }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: null, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to toggle admin role');
      }
    } catch (error) {
      console.error('Error toggling admin role:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.makeAuthenticatedRequest(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: null, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Send password reset email (Admin only)
   */
  async sendPasswordResetEmail(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.makeAuthenticatedRequest('/admin/users/send-reset-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: null, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get user statistics (Admin only)
   */
  async getUserStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeAuthenticatedRequest('/admin/users/statistics');

      const result = await response.json();
      
      if (result.success) {
        return { data: result.stats, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to fetch user statistics');
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Bulk delete users (Admin only)
   */
  async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeAuthenticatedRequest('/admin/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ userIds }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { data: result.results, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to bulk delete users');
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Export users data for reports (Admin only)
   */
  async exportUsersData(options: UserListOptions = {}): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.makeAuthenticatedRequest(
        `/admin/users/export?${queryParams.toString()}`
      );

      const result = await response.json();
      
      if (result.success) {
        return { data: result.users, error: null, status: response.status };
      } else {
        throw new Error(result.error || 'Failed to export users data');
      }
    } catch (error) {
      console.error('Error exporting users data:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Fallback methods using existing Supabase services
   * These provide basic functionality when server API is not available
   */
  fallback: {
    /**
     * Get users using existing admin service (limited functionality)
     */
    async getUsers(options: UserListOptions = {}) {
      try {
        // Import the existing admin service
        const { adminService } = await import('../index');
        
        return await adminService.getUsers({
          page: options.page || 1,
          limit: options.limit || 20,
          search: options.search || '',
          orderBy: options.orderBy || 'created_at',
          orderDirection: options.orderDirection || 'desc'
        });
      } catch (error) {
        console.error('Error using fallback getUsers:', error);
        return { data: null, error: error as Error, status: 500 };
      }
    },

    /**
     * Toggle admin role using existing service
     */
    async toggleAdminRole(userId: string, isCurrentlyAdmin: boolean) {
      try {
        const { adminService } = await import('../index');
        return await adminService.toggleAdminRole(userId, isCurrentlyAdmin);
      } catch (error) {
        console.error('Error using fallback toggleAdminRole:', error);
        return { data: null, error: error as Error, status: 500 };
      }
    }
  }
};