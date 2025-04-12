// src/api/supabase/services/adminService.ts
import { supabaseClient } from '../client';
import { 
  ApiResponse, 
  Category, CategoryInsert, CategoryUpdate,
  Photographer, PhotographerInsert, PhotographerUpdate,
  Location, LocationInsert, LocationUpdate,
  Organisation, OrganisationInsert, OrganisationUpdate,
  Country, CountryInsert, CountryUpdate,
  Collection, CollectionInsert, CollectionUpdate,
  Builder, BuilderInsert, BuilderUpdate,
  UserProfile
} from '../types';

/**
 * Generic CRUD service for admin operations on various database tables
 */
export const adminService = {
  /**
   * Generic function to fetch records from any table with optional filtering
   */
  getRecords: async function<T>(
    tableName,
    options = {}
  ) {
    const {
      page = 1,
      limit = 50,
      orderBy,
      orderDirection = 'asc',
      filters = {},
      select = '*'
    } = options;

    try {
      // Start building the query
      let query = supabaseClient
        .from(tableName)
        .select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && value.includes('%')) {
            // Handle LIKE queries
            query = query.ilike(key, value);
          } else if (Array.isArray(value)) {
            // Handle IN queries
            query = query.in(key, value);
          } else {
            // Handle exact matches
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDirection === 'asc' });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Execute the query
      const { data, error, status } = await query;

      if (error) {
        throw error;
      }

      return { data: data, error: null, status };
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Generic function to fetch a single record by id
   */
  getRecordById: async function<T>(
    tableName,
    id,
    options = {}
  ) {
    const { idField = 'id', select = '*' } = options;

    try {
      const { data, error, status } = await supabaseClient
        .from(tableName)
        .select(select)
        .eq(idField, id)
        .single();

      if (error) {
        throw error;
      }

      return { data: data, error: null, status };
    } catch (error) {
      console.error(`Error fetching record from ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Generic function to create a new record
   */
  createRecord: async function<T>(
    tableName,
    record
  ) {
    try {
      const { data, error, status } = await supabaseClient
        .from(tableName)
        .insert(record)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data, error: null, status };
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Generic function to update a record
   */
  updateRecord: async function<T>(
    tableName,
    id,
    updates,
    options = {}
  ) {
    const { idField = 'id', returning = true } = options;

    try {
      let query = supabaseClient
        .from(tableName)
        .update(updates)
        .eq(idField, id);

      if (returning) {
        query = query.select();
      }

      const { data, error, status } = await query;

      if (error) {
        throw error;
      }

      return { data: returning ? data : null, error: null, status };
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Generic function to delete a record
   */
  deleteRecord: async function(
    tableName,
    id,
    options = {}
  ) {
    const { idField = 'id' } = options;

    try {
      const { error, status } = await supabaseClient
        .from(tableName)
        .delete()
        .eq(idField, id);

      if (error) {
        throw error;
      }

      return { data: null, error: null, status };
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Batch create multiple records
   */
  batchCreateRecords: async function<T>(
    tableName,
    records
  ) {
    try {
      const { data, error, status } = await supabaseClient
        .from(tableName)
        .insert(records)
        .select();

      if (error) {
        throw error;
      }

      return { data: data, error: null, status };
    } catch (error) {
      console.error(`Error batch creating records in ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Count records in a table with optional filtering
   */
  countRecords: async function(
    tableName,
    filters = {}
  ) {
    try {
      // Start building the query
      let query = supabaseClient
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && value.includes('%')) {
            // Handle LIKE queries
            query = query.ilike(key, value);
          } else if (Array.isArray(value)) {
            // Handle IN queries
            query = query.in(key, value);
          } else {
            // Handle exact matches
            query = query.eq(key, value);
          }
        }
      });

      // Execute query
      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return { data: count || 0, error: null, status: 200 };
    } catch (error) {
      console.error(`Error counting records in ${tableName}:`, error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Check if user has admin access
   */
  isAdmin: async function(userId) {
    try {
      const { data, error } = await supabaseClient.rpc('is_admin', { user_id: userId });

      if (error) {
        throw error;
      }

      return { data: !!data, error: null, status: 200 };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { data: false, error: error, status: 500 };
    }
  },

  /**
   * Get all users (for admin panel)
   */
  getUsers: async function(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    try {
      // Start with profiles query
      let query = supabaseClient
        .from('profiles')
        .select('*');

      // Add search if provided
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Add ordering
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Execute query
      const { data, error, status } = await query;

      if (error) {
        throw error;
      }

      // Fetch admin status for each user
      if (data) {
        const usersWithRoles = await Promise.all(
          data.map(async (user) => {
            const { data: isAdminData } = await supabaseClient
              .rpc('is_admin', { user_id: user.id });

            return {
              ...user,
              isAdmin: !!isAdminData
            };
          })
        );

        return { data: usersWithRoles, error: null, status };
      }

      return { data: [], error: null, status };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Toggle admin role for a user
   */
  toggleAdminRole: async function(userId, isAdmin) {
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabaseClient
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }

      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error toggling admin role:', error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Get database storage size
   */
  getStorageSize: async function(bucket, prefix = '') {
    try {
      const { data, error } = await supabaseClient
        .rpc('total_size_in_bucket', { bucket_name: bucket, bucket_prefix: prefix });

      if (error) {
        throw error;
      }

      return { data: data || 0, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting storage size:', error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Manage storage: Reduce storage to a certain size by removing oldest files
   */
  reduceStorage: async function(bucket, prefix, maxSizeBytes) {
    try {
      const { data, error } = await supabaseClient
        .rpc('reduce_storage_lifo', { 
          bucket_name: bucket, 
          bucket_prefix: prefix, 
          max_size_bytes: maxSizeBytes 
        });

      if (error) {
        throw error;
      }

      return { data: data || 0, error: null, status: 200 };
    } catch (error) {
      console.error('Error reducing storage:', error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Get category statistics
   */
  getCategoryStats: async function() {
    try {
      const { data, error } = await supabaseClient
        .from('mobile_catalog_view')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw error;
      }

      // Calculate counts
      const categoryCounts = {};
      data.forEach(item => {
        if (item.category) {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const stats = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      return { data: stats, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting category stats:', error);
      return { data: null, error: error, status: 500 };
    }
  },
  
  /**
   * Get photographer statistics
   */
  getPhotographerStats: async function() {
    try {
      const { data, error } = await supabaseClient
        .from('mobile_catalog_view')
        .select('photographer')
        .not('photographer', 'is', null);

      if (error) {
        throw error;
      }

      // Calculate counts
      const photographerCounts = {};
      data.forEach(item => {
        if (item.photographer) {
          photographerCounts[item.photographer] = (photographerCounts[item.photographer] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const stats = Object.entries(photographerCounts)
        .map(([photographer, count]) => ({ photographer, count }))
        .sort((a, b) => b.count - a.count);

      return { data: stats, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting photographer stats:', error);
      return { data: null, error: error, status: 500 };
    }
  },

  /**
   * Special case methods for specific entities
   */

  // Category-specific methods
  categories: {
    getAll: async function() {
      return adminService.getRecords('category');
    },
    create: async function(data) {
      return adminService.createRecord('category', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('category', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('category', id);
    }
  },

  // Photographer-specific methods
  photographers: {
    getAll: async function() {
      return adminService.getRecords('photographer');
    },
    create: async function(data) {
      return adminService.createRecord('photographer', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('photographer', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('photographer', id);
    }
  },

  // Location-specific methods
  locations: {
    getAll: async function() {
      return adminService.getRecords('location');
    },
    create: async function(data) {
      return adminService.createRecord('location', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('location', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('location', id);
    }
  },

  // Organisation-specific methods
  organisations: {
    getAll: async function() {
      return adminService.getRecords('organisation');
    },
    create: async function(data) {
      return adminService.createRecord('organisation', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('organisation', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('organisation', id);
    }
  },

  // Countries-specific methods
  countries: {
    getAll: async function() {
      return adminService.getRecords('country');
    },
    create: async function(data) {
      return adminService.createRecord('country', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('country', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('country', id);
    }
  },
  
  // Collection-specific methods
  collections: {
    getAll: async function() {
      return adminService.getRecords('collection');
    },
    create: async function(data) {
      return adminService.createRecord('collection', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('collection', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('collection', id);
    }
  },

  // Builder-specific methods
  builders: {
    getAll: async function() {
      return adminService.getRecords('builder');
    },
    create: async function(data) {
      return adminService.createRecord('builder', data);
    },
    update: async function(id, data) {
      return adminService.updateRecord('builder', id, data);
    },
    delete: async function(id) {
      return adminService.deleteRecord('builder', id);
    }
  }
};