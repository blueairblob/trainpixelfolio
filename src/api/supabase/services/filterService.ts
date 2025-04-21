// src/api/supabase/services/filterService.ts

import { supabaseClient } from '../client';
import { ApiResponse } from '../types';
import { getCachedFilterOptions, cacheFilterOptions, clearAllFilterCaches } from '@/utils/filterCache';

interface LookupOptions {
  useCache?: boolean;
  cacheDuration?: number;
  orderBy?: string;
  notNull?: string[];
  limit?: number;
  mapFunction?: (item: any) => any;
}

/**
 * Service for handling filter-related operations with Supabase
 */
export const filterService = {
  /**
   * Generic function to fetch lookup data with caching
   */
  getLookupData: async <T>(
    tableName: string, 
    cacheKey: string,
    columns: string,
    options: LookupOptions = {}
  ): Promise<ApiResponse<T[]>> => {
    const { 
      useCache = true, 
      cacheDuration = 86400000, 
      orderBy,
      notNull = [],
      limit,
      mapFunction 
    } = options;
    
    try {
      // Try to get from cache first if enabled
      if (useCache) {
        const cachedData = await getCachedFilterOptions<T[]>(cacheKey);
        if (cachedData) {
          console.log(`Using cached ${cacheKey}`);
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      // Start building the query
      let query = supabaseClient
        .from(tableName)
        .select(columns);
      
      // Add NOT NULL filters
      notNull.forEach(column => {
        query = query.not(column, 'is', null);
      });
      
      // Add ordering if specified
      if (orderBy) {
        query = query.order(orderBy);
      }
      
      // Add limit if specified
      if (limit) {
        query = query.limit(limit);
      }
      
      // Execute the query
      const { data, error, status } = await query;
      
      if (error) throw error;
      
      // Process the data with the provided map function or default
      let processedData: any[];
      
      if (mapFunction) {
        processedData = data.map(mapFunction);
      } else if (columns.includes(',')) {
        // Default mapping for multi-column queries
        processedData = data.map(item => ({
          id: item.id,
          name: item.name
        }));
      } else {
        // For single column queries, extract unique values
        const uniqueValues = Array.from(
          new Set(
            data.map(item => item[columns]).filter(Boolean)
          )
        ).sort();
        
        processedData = uniqueValues.map(value => ({ 
          id: value,
          name: value 
        }));
      }
      
      // Cache the result if enabled
      if (useCache && processedData.length > 0) {
        await cacheFilterOptions(cacheKey, processedData, cacheDuration);
      }
      
      return { data: processedData as T[], error: null, status };
    } catch (error) {
      console.error(`Error in getLookupData for ${cacheKey}:`, error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Get category options
   */
  getCategories: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'mobile_catalog_view', 
      'categories',
      'category',
      {
        notNull: ['category'],
        ...options
      }
    );
  },

  /**
   * Get photographer options
   */
  getPhotographers: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'photographer', 
      'photographers',
      'id, name',
      {
        orderBy: 'name',
        ...options
      }
    );
  },
  
  /**
   * Get location options
   */
  getLocations: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'location', 
      'locations',
      'id, name',
      {
        orderBy: 'name',
        ...options
      }
    );
  },
  
  /**
   * Get organisation options
   */
  getOrganisations: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'organisation', 
      'organisations',
      'id, name, type',
      {
        orderBy: 'name',
        ...options,
        mapFunction: (org) => ({
          id: org.id,
          name: org.name || 'Unnamed',
          type: org.type
        })
      }
    );
  },
  
  /**
   * Get gauge options
   */
  getGauges: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'mobile_catalog_view', 
      'gauges',
      'gauge',
      {
        notNull: ['gauge'],
        ...options
      }
    );
  },
  
  /**
   * Get collection options
   */
  getCollections: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'collection', 
      'collections',
      'id, name',
      {
        orderBy: 'name',
        ...options
      }
    );
  },
  
  /**
   * Get country options
   */
  getCountries: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'country', 
      'countries',
      'id, name',
      {
        orderBy: 'name',
        ...options
      }
    );
  },
  
  /**
   * Get organisation type options
   */
  getOrganisationTypes: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'organisation',
      'organisation_types',
      'type',
      {
        notNull: ['type'],
        ...options
      }
    );
  },
  
  /**
   * Get active area options
   */
  getActiveAreas: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'mobile_catalog_view',
      'active_areas',
      'active_area',
      {
        notNull: ['active_area'],
        ...options
      }
    );
  },
  
  /**
   * Get route options
   */
  getRoutes: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'route',
      'routes',
      'id, name',
      {
        orderBy: 'name',
        ...options
      }
    );
  },
  
  /**
   * Get corporate body options
   */
  getCorporateBodies: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'mobile_catalog_view',
      'corporate_bodies',
      'corporate_body',
      {
        notNull: ['corporate_body'],
        ...options
      }
    );
  },
  
  /**
   * Get facility options
   */
  getFacilities: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'mobile_catalog_view',
      'facilities',
      'facility',
      {
        notNull: ['facility'],
        ...options
      }
    );
  },
  
  /**
   * Get builder options
   */
  getBuilders: async (options: Partial<LookupOptions> = {}): Promise<ApiResponse<any[]>> => {
    return filterService.getLookupData(
      'builder',
      'builders',
      'id, name, code',
      {
        orderBy: 'name',
        ...options,
        mapFunction: (builder) => ({ 
          id: builder.id, 
          name: builder.name || builder.code || 'Unnamed' 
        })
      }
    );
  },
  
  /**
   * Clear all filter caches
   */
  clearAllCaches: async (): Promise<ApiResponse<null>> => {
    try {
      await clearAllFilterCaches();
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error clearing filter caches:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  }
};