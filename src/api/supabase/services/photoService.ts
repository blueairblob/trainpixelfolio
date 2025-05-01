// src/api/supabase/services/photoService.ts
import { supabaseClient } from '../client';
import { 
  ApiResponse, 
  Photo, 
  PhotoFilter, 
  PaginationOptions, 
  CacheOptions 
} from '../types';
import { getCachedApiData, cacheApiData } from '@/utils/imageCache';

/**
 * Service for handling photo-related operations with Supabase
 */
export const photoService = {
  /**
   * Generate Supabase storage URL for an image
   */
  getImageUrl: (imageNo: string): string => {
    // Normalize the image_no by removing spaces to match the file name format
    const normalizedImageNo = imageNo.replace(/\s/g, '');
    return supabaseClient.storage.from('picaloco').getPublicUrl(`images/${normalizedImageNo}.webp`).data.publicUrl;
  },

  /**
   * Generate Supabase storage URL for a thumbnail
   */
  getThumbnailUrl: (imageNo: string): string => {
    // Normalize the image_no by removing spaces to match the file name format
    const normalizedImageNo = imageNo.replace(/\s/g, '');
    return supabaseClient.storage.from('picaloco').getPublicUrl(`thumbnails/${normalizedImageNo}.webp`).data.publicUrl;
  },

  /**
   * Fetch catalog photos with pagination and caching
   */
  getCatalogPhotos: async (
    options: PaginationOptions & CacheOptions = { page: 1, limit: 10, useCache: true }
  ): Promise<ApiResponse<Photo[]>> => {
    const { page, limit, useCache = true, cacheDuration = 60, forceFresh = false } = options;
    
    try {
      const cacheKey = `photos_page_${page}_limit_${limit}`;
      
      // Try to get from cache first if enabled AND not forced fresh
      if (useCache && !forceFresh) {
        const cachedData = await getCachedApiData<Photo[]>(cacheKey);
        if (cachedData) {
          console.log('Using cached catalog photos for page:', page);
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      // If not in cache or forced fresh, fetch from API
      const offset = (page - 1) * limit;
      
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('*')
        .order('date_taken', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No photos found');
        return { data: [], error: null, status };
      }

      // Add image URLs and normalize the data
      const photosWithUrls = data.map(photo => ({
        ...photo,
        id: photo.image_no, // Ensure id is set for compatibility
        image_url: photoService.getImageUrl(photo.image_no),
        thumbnail_url: photoService.getThumbnailUrl(photo.image_no),
        price: 49.99 // Default price for compatibility
      })) as Photo[];
      
      // Cache the result if enabled and not forced fresh
      if (useCache && !forceFresh && photosWithUrls.length > 0) {
        await cacheApiData(cacheKey, photosWithUrls, cacheDuration);
      }

      return { data: photosWithUrls, error: null, status };
    } catch (error) {
      console.error('Error in getCatalogPhotos:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Fetch photos by category with pagination and caching
   */
  getPhotosByCategory: async (
    category: string,
    options: PaginationOptions & CacheOptions = { page: 1, limit: 10, useCache: true }
  ): Promise<ApiResponse<Photo[]>> => {
    const { page, limit, useCache = true, cacheDuration = 60 } = options;
    
    if (!category) {
      return { data: null, error: new Error('Category is required'), status: 400 };
    }

    try {
      const cacheKey = `category_${category.toLowerCase()}_page_${page}_limit_${limit}`;
      
      // Try to get from cache first if enabled
      if (useCache) {
        const cachedData = await getCachedApiData<Photo[]>(cacheKey);
        if (cachedData) {
          console.log('Using cached category photos for:', category, 'page:', page);
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      // If not in cache, fetch from API
      const offset = (page - 1) * limit;
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('*')
        .eq('category', category)
        .order('date_taken', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn(`No photos found for category: ${category}`);
        return { data: [], error: null, status };
      }

      // Add image URLs and normalize the data
      const photosWithUrls = data.map(photo => ({
        ...photo,
        id: photo.image_no, // Ensure id is set for compatibility
        image_url: photoService.getImageUrl(photo.image_no),
        thumbnail_url: photoService.getThumbnailUrl(photo.image_no),
        price: 49.99 // Default price for compatibility
      })) as Photo[];
      
      // Cache the result if enabled
      if (useCache && photosWithUrls.length > 0) {
        await cacheApiData(cacheKey, photosWithUrls, cacheDuration);
      }

      return { data: photosWithUrls, error: null, status };
    } catch (error) {
      console.error('Error in getPhotosByCategory:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Fetch a single photo by its ID (image_no)
   */
  getPhotoById: async (imageNo: string, options: CacheOptions = { useCache: true, cacheDuration: 180 }): Promise<ApiResponse<Photo>> => {
    const { useCache = true, cacheDuration = 180 } = options;
    
    if (!imageNo) {
      return { data: null, error: new Error('Image number is required'), status: 400 };
    }

    try {
      // Add debug logging
      console.log(`Attempting to fetch photo with ID: ${imageNo}`);
      
      const cacheKey = `photo_${imageNo}`;
      
      // Try to get from cache first if enabled
      if (useCache) {
        const cachedData = await getCachedApiData<Photo>(cacheKey);
        if (cachedData) {
          console.log('Using cached photo data for:', imageNo);
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      // If not in cache, fetch from API
      // First, try to get the photo from mobile_catalog_view
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('*')
        .eq('image_no', imageNo)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching photo ${imageNo}:`, error);
        throw error;
      }
      
      if (!data) {
        console.error(`Photo not found with image_no: ${imageNo}`);
        
        // Try an alternative fetch using a different field if needed
        // For example, if sometimes the ID might be a UUID:
        console.log(`Attempting alternative fetch for photo: ${imageNo}`);
        const { data: altData, error: altError } = await supabaseClient
          .from('mobile_catalog_view')
          .select('*')
          .or(`id.eq.${imageNo},image_no.ilike.%${imageNo}%`)
          .maybeSingle();
          
        if (altError || !altData) {
          return { data: null, error: new Error('Photo not found'), status: 404 };
        }
        
        console.log(`Found photo via alternative lookup method: ${altData.image_no}`);
        data = altData;
      }

      // Add image URL
      const photoWithUrl = {
        ...data,
        id: data.image_no, // Keep this for compatibility with UI
        image_url: photoService.getImageUrl(data.image_no),
        thumbnail_url: photoService.getThumbnailUrl(data.image_no),
        price: 49.99 // Default price for compatibility
      } as Photo;
      
      // Cache the result if enabled
      if (useCache) {
        await cacheApiData(cacheKey, photoWithUrl, cacheDuration);
      }
      
      return { data: photoWithUrl, error: null, status };
    } catch (error) {
      console.error('Error in getPhotoById:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**

  * Fetch unique categories
   */
  getCategories: async (
    options: CacheOptions = { useCache: true, cacheDuration: 1440 }
  ): Promise<ApiResponse<string[]>> => {
    const { useCache = true, cacheDuration = 1440, forceFresh = false } = options;
    
    try {
      const cacheKey = 'categories_list';
      
      // Try to get from cache first if enabled AND not forced fresh
      if (useCache && !forceFresh) {
        const cachedData = await getCachedApiData<string[]>(cacheKey);
        if (cachedData) {
          console.log('Using cached categories data');
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('category')
        .not('category', 'is', null);
      
      if (error) {
        throw error;
      }
      
      // Extract unique categories
      const categories = Array.from(
        new Set(
          data
            .map(item => item.category)
            .filter(Boolean) as string[]
        )
      ).sort();
      
      // Cache the result if enabled and not forced fresh
      if (useCache && !forceFresh) {
        await cacheApiData(cacheKey, categories, cacheDuration);
      }
      
      return { data: categories, error: null, status };
    } catch (error) {
      console.error('Error in getCategories:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Search photos by query term
   */
  searchPhotos: async (
    searchQuery: string,
    options: PaginationOptions & CacheOptions = { page: 1, limit: 10, useCache: true, cacheDuration: 15 }
  ): Promise<ApiResponse<Photo[]>> => {
    const { page, limit, useCache = true, cacheDuration = 15 } = options;
    
    try {
      // If search query is empty, return regular catalog photos
      if (!searchQuery.trim()) {
        return await photoService.getCatalogPhotos({ page, limit, useCache, cacheDuration });
      }
      
      const query = searchQuery.toLowerCase().trim();
      const cacheKey = `search_${query}_page_${page}_limit_${limit}`;
      
      // Try to get from cache first if enabled
      if (useCache) {
        const cachedResults = await getCachedApiData<Photo[]>(cacheKey);
        if (cachedResults) {
          console.log('Using cached search results for:', searchQuery, 'page:', page);
          return { data: cachedResults, error: null, status: 200 };
        }
      }
      
      // Not in cache, perform the search
      const offset = (page - 1) * limit;
      
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('*')
        .or(`description.ilike.%${query}%,category.ilike.%${query}%,photographer.ilike.%${query}%,location.ilike.%${query}%`)
        .order('date_taken', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw error;
      }
      
      console.log(`Search returned ${data?.length || 0} results`);
      
      if (!data || data.length === 0) {
        return { data: [], error: null, status };
      }
      
      // Add image URLs and normalize the data
      const photosWithUrls = data.map(photo => ({
        ...photo,
        id: photo.image_no, // Ensure id is set for compatibility
        image_url: photoService.getImageUrl(photo.image_no),
        thumbnail_url: photoService.getThumbnailUrl(photo.image_no),
        price: 49.99 // Default price for compatibility
      })) as Photo[];
      
      // Cache the search results if enabled
      if (useCache && photosWithUrls.length > 0) {
        await cacheApiData(cacheKey, photosWithUrls, cacheDuration);
      }
      
      return { data: photosWithUrls, error: null, status };
    } catch (error) {
      console.error('Error in searchPhotos:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Filter photos with various criteria
   */
  filterPhotos: async (
    filters: PhotoFilter,
    options: PaginationOptions & CacheOptions = { page: 1, limit: 50, useCache: false }
  ): Promise<ApiResponse<Photo[]>> => {
    const { page, limit } = options;
    
    try {
      // Start with base query
      let query = supabaseClient
        .from('mobile_catalog_view')
        .select('*');
      
      // Add filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.photographer) {
        query = query.ilike('photographer', `%${filters.photographer}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.organisation) {
        query = query.ilike('organisation', `%${filters.organisation}%`);
      }
      
      if (filters.gauge) {
        query = query.eq('gauge', filters.gauge);
      }
      
      // Date range filters
      if (filters.dateFrom) {
        query = query.gte('date_taken', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date_taken', filters.dateTo);
      }
      
      // Add text search if present
      if (filters.searchQuery) {
        query = query.or(
          `description.ilike.%${filters.searchQuery}%,` +
          `photographer.ilike.%${filters.searchQuery}%,` +
          `location.ilike.%${filters.searchQuery}%,` +
          `category.ilike.%${filters.searchQuery}%`
        );
      }
      
      // Add pagination and order
      const offset = (page - 1) * limit;
      query = query
        .order('date_taken', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Execute query
      const { data, error, status } = await query;
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return { data: [], error: null, status };
      }
      
      // Add image URLs
      const photosWithUrls = data.map(photo => ({
        ...photo,
        id: photo.image_no,
        image_url: photoService.getImageUrl(photo.image_no),
        thumbnail_url: photoService.getThumbnailUrl(photo.image_no),
        price: 49.99 // Default price for compatibility
      })) as Photo[];
      
      return { data: photosWithUrls, error: null, status };
    } catch (error) {
      console.error('Error in filterPhotos:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Get detailed photo statistics
   */
  getPhotoStats: async (): Promise<ApiResponse<any>> => {
    try {
      const { data, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('category, photographer, gauge')
        .not('category', 'is', null);
      
      if (error) {
        throw error;
      }
      
      // Calculate statistics
      const categoryCount: Record<string, number> = {};
      const photographerCount: Record<string, number> = {};
      const gaugeCount: Record<string, number> = {};
      
      data.forEach(item => {
        // Count categories
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        }
        
        // Count photographers
        if (item.photographer) {
          photographerCount[item.photographer] = (photographerCount[item.photographer] || 0) + 1;
        }
        
        // Count gauges
        if (item.gauge) {
          gaugeCount[item.gauge] = (gaugeCount[item.gauge] || 0) + 1;
        }
      });
      
      const stats = {
        totalPhotos: data.length,
        categoryStats: Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
        photographerStats: Object.entries(photographerCount)
          .map(([photographer, count]) => ({ photographer, count }))
          .sort((a, b) => b.count - a.count),
        gaugeStats: Object.entries(gaugeCount)
          .map(([gauge, count]) => ({ gauge, count }))
          .sort((a, b) => b.count - a.count)
      };
      
      return { data: stats, error: null, status };
    } catch (error) {
      console.error('Error getting photo stats:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  /**
   * Get total photo count with caching
   */
  getTotalPhotoCount: async (
    options: CacheOptions = { useCache: true, cacheDuration: 3600 }
  ): Promise<ApiResponse<number>> => {
    const { useCache = true, cacheDuration = 3600, forceFresh = false } = options;
    
    try {
      const cacheKey = 'total_photo_count';
      
      // Try to get from cache first if enabled AND not forced fresh
      if (useCache && !forceFresh) {
        const cachedData = await getCachedApiData<number>(cacheKey);
        if (cachedData !== null) {
          console.log('Using cached total photo count');
          return { data: cachedData, error: null, status: 200 };
        }
      }
      
      // If not in cache or forced fresh, fetch from API
      const { count, error, status } = await supabaseClient
        .from('mobile_catalog_view')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      // Cache the result if enabled
      if (useCache && !forceFresh && count !== null) {
        await cacheApiData(cacheKey, count, cacheDuration);
      }
      
      return { data: count || 0, error: null, status };
    } catch (error) {
      console.error('Error in getTotalPhotoCount:', error);
      return { data: 0, error: error as Error, status: 500 };
    }
  }
};