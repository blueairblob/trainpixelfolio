// src/services/catalogService.ts
import { supabaseClient } from "@/api/supabase/client";
import { getCachedApiData, cacheApiData } from "@/utils/imageCache";

// Define the types for the catalog data
export interface CatalogPhoto {
  image_no: string;
  category: string | null;
  date_taken: string | null;
  circa: boolean | null;
  imprecise_date: boolean | null;
  description: string | null;
  gauge: string | null;
  thumbnail_url: string;
  image_url?: string;
  id?: string;  // Added for compatibility with other parts of the app
  country: string | null;
  organisation: string | null;
  organisation_type: string | null;
  location: string | null;
  route: string | null;
  collection: string | null;
  photographer: string | null;
  prints_allowed: boolean | null;
  internet_use: boolean | null;
  publications_use: boolean | null;
  builders: any[] | null;
  file_type: string | null;
  width: number | null;
  height: number | null;
  resolution: number | null;
  colour_space: string | null;
  colour_mode: string | null;
  cd_no: string | null;
  cd_no_hr: string | null;
  bw_image_no: string | null;
  bw_cd_no: string | null;
  active_area: string | null;
  corporate_body: string | null;
  facility: string | null;
  last_updated: string | null;
}

export interface PhotoFetchOptions {
  page?: number;
  limit?: number;
  useCache?: boolean;
  cacheDuration?: number; // minutes
  forceFresh?: boolean;  // Added to explicitly bypass cache
}

const DEFAULT_OPTIONS: PhotoFetchOptions = {
  page: 1,
  limit: 10,
  useCache: true,
  cacheDuration: 60 // 1 hour
};

/**
 * Generate Supabase storage URL for an image
 */
export const getImageUrl = (imageNo: string): string => {
  // Normalize the image_no by removing spaces to match the file name format
  const normalizedImageNo = imageNo.replace(/\s/g, ''); // e.g., "Class 1800 (10)" -> "Class1800(10)"
  const url = supabaseClient.storage.from('picaloco').getPublicUrl(`images/${normalizedImageNo}.webp`).data.publicUrl;
  return url;
};

/**
 * Fetch catalog photos with pagination and caching
 */
export const getCatalogPhotos = async (
  page: number = 1, 
  limit: number = 10,
  options?: Partial<Omit<PhotoFetchOptions, 'page' | 'limit'>>
): Promise<CatalogPhoto[]> => {
  const { useCache, cacheDuration, forceFresh } = { ...DEFAULT_OPTIONS, ...options, page, limit };
  
  try {
    const cacheKey = `photos_page_${page}_limit_${limit}`;
    
    // Try to get from cache first if enabled AND not forced fresh
    if (useCache && !forceFresh) {
      const cachedData = await getCachedApiData<CatalogPhoto[]>(cacheKey);
      if (cachedData) {
        console.log('Using cached catalog photos for page:', page);
        return cachedData;
      }
    } else if (forceFresh) {
      console.log('Bypassing cache for catalog photos, getting fresh data');
    }
    
    // If not in cache or forced fresh, fetch from API
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabaseClient
      .from('mobile_catalog_view')
      .select('*')
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No photos found');
      return [];
    }

    // Add image URLs and normalize the data
    const photosWithUrls = data.map(photo => ({
      ...photo,
      id: photo.image_no, // Ensure id is set for compatibility
      image_url: getImageUrl(photo.image_no)
    })) as CatalogPhoto[];
    
    // Cache the result if enabled and not forced fresh
    if (useCache && !forceFresh && photosWithUrls.length > 0) {
      await cacheApiData(cacheKey, photosWithUrls, cacheDuration);
    }

    return photosWithUrls;
  } catch (error) {
    console.error('Error in fetchCatalogPhotos:', error);
    throw error;
  }
};


/**
 * Fetch photos by category with pagination and caching
 */
export const getPhotosByCategory = async (
  category: string, 
  page: number = 1, 
  limit: number = 10,
  options?: Partial<Omit<PhotoFetchOptions, 'page' | 'limit'>>
): Promise<CatalogPhoto[]> => {
  const { useCache, cacheDuration } = { ...DEFAULT_OPTIONS, ...options, page, limit };
  
  if (!category) {
    throw new Error('Category is required');
  }

  try {
    const cacheKey = `category_${category.toLowerCase()}_page_${page}_limit_${limit}`;
    
    // Try to get from cache first if enabled
    if (useCache) {
      const cachedData = await getCachedApiData<CatalogPhoto[]>(cacheKey);
      if (cachedData) {
        console.log('Using cached category photos for:', category, 'page:', page);
        return cachedData;
      }
    }
    
    // If not in cache, fetch from API
    const offset = (page - 1) * limit;
    const { data, error } = await supabaseClient
      .from('mobile_catalog_view')
      .select('*')
      .eq('category', category)
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn(`No photos found for category: ${category}`);
      return [];
    }

    // Add image URLs and normalize the data
    const photosWithUrls = data.map(photo => ({
      ...photo,
      id: photo.image_no, // Ensure id is set for compatibility
      image_url: getImageUrl(photo.image_no)
    }));
    
    // Cache the result if enabled
    if (useCache && photosWithUrls.length > 0) {
      await cacheApiData(cacheKey, photosWithUrls, cacheDuration);
    }

    return photosWithUrls;
  } catch (error) {
    console.error('Error in fetchPhotosByCategory:', error);
    throw error;
  }
};

/**
 * Fetch a single photo by its ID (image_no)
 */
export const getPhotoById = async (
  imageNo: string, 
  options?: Partial<Omit<PhotoFetchOptions, 'page' | 'limit'>>
): Promise<CatalogPhoto | null> => {
  const { useCache, cacheDuration } = { ...DEFAULT_OPTIONS, ...options };
  
  if (!imageNo) {
    throw new Error('Image number is required');
  }

  try {
    const cacheKey = `photo_${imageNo}`;
    
    // Try to get from cache first if enabled
    if (useCache) {
      const cachedData = await getCachedApiData<CatalogPhoto | null>(cacheKey);
      if (cachedData) {
        console.log('Using cached photo data for:', imageNo);
        return cachedData;
      }
    }
    
    // If not in cache, fetch from API
    const { data, error } = await supabaseClient
      .from('mobile_catalog_view')
      .select('*')
      .eq('image_no', imageNo)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching photo by ID:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }

    // Add image URL
    const photoWithUrl = {
      ...data,
      id: data.image_no, // Ensure id is set for compatibility
      image_url: getImageUrl(data.image_no)
    };
    
    // Cache the result if enabled
    if (useCache) {
      await cacheApiData(cacheKey, photoWithUrl, cacheDuration || 180); // Cache individual photos longer (3 hours)
    }
    
    return photoWithUrl;
  } catch (error) {
    console.error('Error in fetchPhotoById:', error);
    throw error;
  }
};

/**
 * Fetch unique categories
 */
export const getCategories = async (
  options?: Partial<Omit<PhotoFetchOptions, 'page' | 'limit'>>
): Promise<string[]> => {
  const { useCache, cacheDuration, forceFresh } = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const cacheKey = 'categories_list';
    
    // Try to get from cache first if enabled AND not forced fresh
    if (useCache && !forceFresh) {
      const cachedData = await getCachedApiData<string[]>(cacheKey);
      if (cachedData) {
        console.log('Using cached categories data');
        return cachedData;
      }
    } else if (forceFresh) {
      console.log('Bypassing cache for categories, getting fresh data');
    }
  
    
    const { data, error } = await supabaseClient
      .from('mobile_catalog_view')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    // Extract unique categories
    const categories = data
      .map(item => item.category as string)
      .filter((value, index, self) => 
        value && self.indexOf(value) === index
      ) as string[];
    
    // Sort alphabetically
    categories.sort();
    
    // Cache the result if enabled and not forced fresh
    if (useCache && !forceFresh) {
      await cacheApiData(cacheKey, categories, cacheDuration || 1440); // Cache categories for 1 day
    }
    
    return categories;
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

/**
 * Search photos by query term
 */
export const searchPhotos = async (
  searchQuery: string,
  page: number = 1,
  limit: number = 10,
  options?: Partial<Omit<PhotoFetchOptions, 'page' | 'limit'>>
): Promise<CatalogPhoto[]> => {
  const { useCache, cacheDuration } = { ...DEFAULT_OPTIONS, ...options, page, limit };
  
  try {
    // If search query is empty, return regular catalog photos
    if (!searchQuery.trim()) {
      return await fetchCatalogPhotos(page, limit, { useCache, cacheDuration });
    }
    
    const query = searchQuery.toLowerCase().trim();
    const cacheKey = `search_${query}_page_${page}_limit_${limit}`;
    
    // Try to get from cache first if enabled
    if (useCache) {
      const cachedResults = await getCachedApiData(cacheKey);
      if (cachedResults) {
        console.log('Using cached search results for:', searchQuery, 'page:', page);
        return cachedResults;
      }
    }
    
    // Not in cache, perform the search
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabaseClient
      .from('mobile_catalog_view')
      .select('*')
      .or(`description.ilike.%${query}%,category.ilike.%${query}%,photographer.ilike.%${query}%,location.ilike.%${query}%`)
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }
    
    console.log(`Search returned ${data?.length || 0} results`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Add image URLs and normalize the data
    const photosWithUrls = data.map(photo => ({
      ...photo,
      id: photo.image_no, // Ensure id is set for compatibility
      image_url: getImageUrl(photo.image_no)
    })) as CatalogPhoto[];
    
    // Cache the search results if enabled
    if (useCache && photosWithUrls.length > 0) {
      await cacheApiData(cacheKey, photosWithUrls, cacheDuration || 15); // Cache search results for 15 minutes
    }
    
    return photosWithUrls;
  } catch (error) {
    console.error('Error in searchPhotos:', error);
    throw error;
  }
};

// Add photoService filter helpers for compatibility
export interface PhotoFilters {
  tags: string[];
  photographers: string[];
  locations: string[];
  priceRange: [number, number];
  orientation?: 'landscape' | 'portrait' | undefined;
  sortBy: 'newest' | 'popular' | 'price_high' | 'price_low';
}

/**
 * Check if filters are active
 */
export const hasActiveFilters = (
  filters: PhotoFilters, 
  defaultMinPrice: number, 
  defaultMaxPrice: number
): boolean => {
  const { tags, photographers, locations, priceRange } = filters;
  
  return (
    tags.length > 0 || 
    photographers.length > 0 || 
    locations.length > 0 || 
    priceRange[0] > defaultMinPrice || 
    priceRange[1] < defaultMaxPrice
  );
};

/**
 * Count active filters
 */
export const countActiveFilters = (
  filters: PhotoFilters, 
  defaultMinPrice: number, 
  defaultMaxPrice: number
): number => {
  const { tags, photographers, locations, priceRange } = filters;
  
  let count = 0;
  if (tags.length > 0) count += 1;
  if (photographers.length > 0) count += 1;
  if (locations.length > 0) count += 1;
  if (priceRange[0] > defaultMinPrice || priceRange[1] < defaultMaxPrice) count += 1;
  
  return count;
};

// Bypass cache for filtered queries
export const getFilteredPhotos = async (
  filters: any, // Your filter object structure
  options: PhotoFetchOptions = DEFAULT_OPTIONS
): Promise<CatalogPhoto[]> => {
  console.log('Executing filtered query with fresh data');
  
  try {
    // Build the base query
    let query = supabaseClient
      .from('mobile_catalog_view')
      .select('*');
      
    // Apply your filters here...
    // ...
    
    const { data, error } = await query
      .order('date_taken', { ascending: false })
      .limit(options.limit || 50);
      
    if (error) throw error;
    
    // Process data and return
    const photosWithUrls = (data || []).map(photo => ({
      ...photo,
      id: photo.image_no,
      image_url: getImageUrl(photo.image_no)
    }));
    
    return photosWithUrls;
  } catch (error) {
    console.error('Error in fetchFilteredPhotos:', error);
    throw error;
  }
};


/**
 * Filter photos based on criteria
 * (Compatible with both Photo and CatalogPhoto types)
 */
export const filterPhotos = (photos: CatalogPhoto[], filters: PhotoFilters): CatalogPhoto[] => {
  const { tags, photographers, locations, priceRange, sortBy } = filters;
  
  // Filter photos
  let filtered = [...photos];
  
  // Handle tags (this is different between Photo and CatalogPhoto)
  if (tags.length > 0) {
    filtered = filtered.filter(photo => {
      // For CatalogPhoto, use category
      if (photo.category && tags.includes(photo.category)) {
        return true;
      }
      
      // For objects with tags array (like from photoService)
      if ('tags' in photo && Array.isArray(photo.tags)) {
        return tags.some(tag => photo.tags.includes(tag));
      }
      
      return false;
    });
  }
  
  // Filter by photographer
  if (photographers.length > 0) {
    filtered = filtered.filter(photo => 
      photo.photographer && photographers.includes(photo.photographer)
    );
  }
  
  // Filter by location
  if (locations.length > 0) {
    filtered = filtered.filter(photo => 
      photo.location && locations.includes(photo.location)
    );
  }
  
  // Price filtering is skipped for CatalogPhoto as it doesn't have price field
  
  // Sort photos based on available properties
  if (sortBy) {
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.date_taken ? new Date(a.date_taken).getTime() : 0;
          const dateB = b.date_taken ? new Date(b.date_taken).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        // If we had a popularity metric, we'd use it here
        break;
      case 'price_high':
      case 'price_low':
        // Price sorting skipped for CatalogPhoto as it doesn't have price field
        break;
    }
  }
  
  return filtered;
};