// src/context/FilterContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabaseClient } from '@/api/supabase/client';
import { CatalogPhoto } from '@/services/catalogService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our filters
export interface Organisation {
  id: string;
  name: string;
  type: string | null;
}

export interface Location {
  id: string;
  name: string;
  country: { id: string; name: string } | null;
}

export interface Photographer {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  owner: string | null;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

// Define the shape of our filter state
export interface FilterState {
  organisation: Organisation | null;
  location: Location | null;
  photographer: Photographer | null;
  collection: Collection | null;
  dateRange: DateRange | null;
  gauge: string | null;
  searchQuery: string;
  // New filter fields matching FileMaker Pro
  country: string | null;
  organisationType: string | null;
  industryType: string | null;
  activeArea: string | null;
  route: string | null;
  corporateBody: string | null;
  facility: string | null;
  description: string | null;
  builder: string | null;
  worksNumber: string | null;
  imageNo: string | null;
}

// Define the context interface
interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  setOrganisation: (org: Organisation | null) => void;
  setLocation: (location: Location | null) => void;
  setPhotographer: (photographer: Photographer | null) => void;
  setCollection: (collection: Collection | null) => void;
  setDateRange: (range: DateRange | null) => void;
  setGauge: (gauge: string | null) => void;
  setSearchQuery: (query: string) => void;
  // New setters for FileMaker Pro filters
  setCountry: (country: string | null) => void;
  setOrganisationType: (type: string | null) => void;
  setIndustryType: (type: string | null) => void;
  setActiveArea: (area: string | null) => void;
  setRoute: (route: string | null) => void;
  setCorporateBody: (body: string | null) => void;
  setFacility: (facility: string | null) => void;
  setDescription: (description: string | null) => void;
  setBuilder: (builder: string | null) => void;
  setWorksNumber: (number: string | null) => void;
  setImageNo: (number: string | null) => void;
  clearAllFilters: () => void;
  applyFilters: (baseQuery: any) => any; // Returns a modified query
  isLoading: boolean;
  error: string | null;
  filteredResults: CatalogPhoto[];
  hasActiveFilters: boolean;
  refreshFilters: () => Promise<void>;
}

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Initial filter state
const initialFilterState: FilterState = {
  organisation: null,
  location: null,
  photographer: null,
  collection: null,
  dateRange: null,
  gauge: null,
  searchQuery: '',
  // Initialize new fields
  country: null,
  organisationType: null,
  industryType: null,
  activeArea: null,
  route: null,
  corporateBody: null,
  facility: null,
  description: null,
  builder: null,
  worksNumber: null,
  imageNo: null
};

// Helper function to clear catalog cache
export const clearCatalogCache = async () => {
  // Get all AsyncStorage keys
  const keys = await AsyncStorage.getAllKeys();
  
  // Filter for catalog-related cache keys
  const catalogCacheKeys = keys.filter(key => 
    key.startsWith('app_cache_photos_page_') || 
    key.startsWith('app_cache_category_') ||
    key.startsWith('app_cache_photo_')
  );
  
  // Remove these cache entries
  if (catalogCacheKeys.length > 0) {
    console.log(`Clearing ${catalogCacheKeys.length} catalog cache items`);
    await AsyncStorage.multiRemove(catalogCacheKeys);
    return true;
  }
  
  return false;
};

// Provider component
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFiltersState] = useState<FilterState>(initialFilterState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<CatalogPhoto[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && 
    value !== '' && 
    (typeof value !== 'object' || Object.values(value).some(v => v !== null && v !== ''))
  );

  // Filter setters
  const setFilters = (newFilters: Partial<FilterState>) => {
    console.log('Setting multiple filters:', newFilters);
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const setOrganisation = (org: Organisation | null) => {
    console.log('Setting organisation filter:', org);
    setFiltersState(prev => ({ ...prev, organisation: org }));
  };

  const setLocation = (location: Location | null) => {
    setFiltersState(prev => ({ ...prev, location }));
  };

  const setPhotographer = (photographer: Photographer | null) => {
    setFiltersState(prev => ({ ...prev, photographer }));
  };

  const setCollection = (collection: Collection | null) => {
    setFiltersState(prev => ({ ...prev, collection }));
  };

  const setDateRange = (range: DateRange | null) => {
    setFiltersState(prev => ({ ...prev, dateRange: range }));
  };

  const setGauge = (gauge: string | null) => {
    setFiltersState(prev => ({ ...prev, gauge }));
  };

  const setSearchQuery = (query: string) => {
    setFiltersState(prev => ({ ...prev, searchQuery: query }));
  };

  // New setters for FileMaker Pro filters
  const setCountry = (country: string | null) => {
    setFiltersState(prev => ({ ...prev, country }));
  };

  const setOrganisationType = (type: string | null) => {
    setFiltersState(prev => ({ ...prev, organisationType: type }));
  };

  const setIndustryType = (type: string | null) => {
    setFiltersState(prev => ({ ...prev, industryType: type }));
  };

  const setActiveArea = (area: string | null) => {
    setFiltersState(prev => ({ ...prev, activeArea: area }));
  };

  const setRoute = (route: string | null) => {
    setFiltersState(prev => ({ ...prev, route }));
  };

  const setCorporateBody = (body: string | null) => {
    setFiltersState(prev => ({ ...prev, corporateBody: body }));
  };

  const setFacility = (facility: string | null) => {
    setFiltersState(prev => ({ ...prev, facility }));
  };

  const setDescription = (description: string | null) => {
    setFiltersState(prev => ({ ...prev, description }));
  };

  const setBuilder = (builder: string | null) => {
    setFiltersState(prev => ({ ...prev, builder }));
  };

  const setWorksNumber = (number: string | null) => {
    setFiltersState(prev => ({ ...prev, worksNumber: number }));
  };

  const setImageNo = (number: string | null) => {
    setFiltersState(prev => ({ ...prev, imageNo: number }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setFiltersState(initialFilterState);
    setFilteredResults([]);
  };

  // Force refresh filters by clearing cache and triggering a re-fetch
  const refreshFilters = async () => {
    try {
      // First, clear the catalog cache to force fresh data
      const cleared = await clearCatalogCache();
      console.log(`Cache cleared: ${cleared}`);
      
      // Then update the lastRefreshTime to trigger a re-fetch
      setLastRefreshTime(Date.now());
      
      console.log('Filters refreshed at:', new Date().toISOString());
      return;
    } catch (err) {
      console.error('Error refreshing filters:', err);
    }
  };

  // Apply filters to a query
  const applyFilters = useCallback((baseQuery: any) => {
    let query = baseQuery;
    console.log('Starting to apply filters to query');

    // Apply organisation filter
    if (filters.organisation) {
      console.log(`Filtering by organisation: ${JSON.stringify(filters.organisation)}`);
      query = query.ilike('organisation', `%${filters.organisation.name}%`);
    }

    // Apply location filter
    if (filters.location) {
      console.log(`Filtering by location: ${filters.location.name}`);
      query = query.ilike('location', `%${filters.location.name}%`);
    }

    // Apply photographer filter
    if (filters.photographer) {
      console.log(`Filtering by photographer: ${filters.photographer.name}`);
      query = query.ilike('photographer', `%${filters.photographer.name}%`);
    }

    // Apply collection filter
    if (filters.collection) {
      console.log(`Filtering by collection: ${filters.collection.name}`);
      query = query.ilike('collection', `%${filters.collection.name}%`);
    }

    // Apply date range filter
    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        console.log(`Filtering by start date: ${filters.dateRange.startDate}`);
        query = query.gte('date_taken', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        console.log(`Filtering by end date: ${filters.dateRange.endDate}`);
        query = query.lte('date_taken', filters.dateRange.endDate);
      }
    }

    // Apply gauge filter
    if (filters.gauge) {
      console.log(`Filtering by gauge: ${filters.gauge}`);
      query = query.eq('gauge', filters.gauge);
    }

    // Apply search query
    if (filters.searchQuery) {
      console.log(`Applying search query: ${filters.searchQuery}`);
      query = query.or(
        `description.ilike.%${filters.searchQuery}%,` +
        `category.ilike.%${filters.searchQuery}%,` +
        `photographer.ilike.%${filters.searchQuery}%,` +
        `location.ilike.%${filters.searchQuery}%,` +
        `organisation.ilike.%${filters.searchQuery}%`
      );
    }

    // Apply new FileMaker Pro filters
    if (filters.country) {
      console.log(`Filtering by country: ${filters.country}`);
      query = query.eq('country', filters.country);
    }

    if (filters.organisationType) {
      console.log(`Filtering by organisation type: ${filters.organisationType}`);
      query = query.eq('organisation_type', filters.organisationType);
    }

    if (filters.industryType) {
      console.log(`Filtering by industry type: ${filters.industryType}`);
      query = query.ilike('type_of_industry', `%${filters.industryType}%`);
    }

    if (filters.activeArea) {
      console.log(`Filtering by active area: ${filters.activeArea}`);
      query = query.ilike('active_area', `%${filters.activeArea}%`);
    }

    if (filters.route) {
      console.log(`Filtering by route: ${filters.route}`);
      query = query.eq('route', filters.route);
    }

    if (filters.corporateBody) {
      console.log(`Filtering by corporate body: ${filters.corporateBody}`);
      query = query.ilike('corporate_body', `%${filters.corporateBody}%`);
    }

    if (filters.facility) {
      console.log(`Filtering by facility: ${filters.facility}`);
      query = query.ilike('facility', `%${filters.facility}%`);
    }

    if (filters.description) {
      console.log(`Filtering by description: ${filters.description}`);
      query = query.ilike('description', `%${filters.description}%`);
    }

    if (filters.builder) {
      console.log(`Filtering by builder: ${filters.builder}`);
      // This is a bit complex since builders are in a JSON array field
      query = query.or(`builders::jsonb @> '[{"builder_id": "${filters.builder}"}]'::jsonb,builders::jsonb @> '[{"builder_name": "${filters.builder}"}]'::jsonb`);
    }

    if (filters.worksNumber) {
      console.log(`Filtering by works number: ${filters.worksNumber}`);
      // This is also in the builders JSON array
      query = query.or(`builders::jsonb @> '[{"works_number": "${filters.worksNumber}"}]'::jsonb`);
    }

    if (filters.imageNo) {
      console.log(`Filtering by image number: ${filters.imageNo}`);
      query = query.ilike('image_no', `%${filters.imageNo}%`);
    }

    console.log('Finished applying filters to query');
    return query;
  }, [filters]);

  // Execute a filtered query
  const executeFilteredQuery = useCallback(async () => {
    if (!hasActiveFilters) {
      console.log('No active filters, skipping filtered query');
      setFilteredResults([]);
      return;
    }

    console.log('==== EXECUTING FILTERED QUERY ====');
    console.log('Active filters:', JSON.stringify(filters, null, 2));
    setIsLoading(true);
    setError(null);

    try {
      // Start with a base query
      let query = supabaseClient
        .from('mobile_catalog_view')
        .select('*')
        .order('date_taken', { ascending: false });

      // Apply all the filters
      console.log('Applying filters to Supabase query...');
      query = applyFilters(query);
      
      // Limit results for performance
      query = query.limit(50);
      
      console.log('Executing Supabase query');
      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Supabase query error:', queryError);
        throw queryError;
      }

      // Process and set the results
      const results = data || [];
      console.log(`Query returned ${results.length} results (FRESH DATA)`);
      
      const processedResults = results.map(item => ({
        ...item,
        id: item.image_no, // Ensure id is set for compatibility
        image_url: getImageUrl(item.image_no)
      }));
      
      console.log(`Processed ${processedResults.length} results with image URLs`);
      
      // Log a sample result to help debugging
      if (processedResults.length > 0) {
        console.log('Sample result (first item):', {
          id: processedResults[0].id,
          image_no: processedResults[0].image_no,
          description: processedResults[0].description
        });
      }
      
      setFilteredResults(processedResults);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error executing filtered query:', errorMessage);
      setError(errorMessage);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [applyFilters, hasActiveFilters, filters]);

  // Function to generate image URLs (copied from catalogService)
  const getImageUrl = (imageNo: string): string => {
    // Normalize the image_no by removing spaces to match the file name format
    const normalizedImageNo = imageNo.replace(/\s/g, '');
    const url = supabaseClient.storage.from('picaloco').getPublicUrl(`images/${normalizedImageNo}.webp`).data.publicUrl;
    return url;
  };

  // Execute query when filters change
  useEffect(() => {
    executeFilteredQuery();
  }, [executeFilteredQuery, lastRefreshTime]);

  const value = {
    filters,
    setFilters,
    setOrganisation,
    setLocation,
    setPhotographer,
    setCollection,
    setDateRange,
    setGauge,
    setSearchQuery,
    // New FileMaker Pro filter setters
    setCountry,
    setOrganisationType,
    setIndustryType,
    setActiveArea,
    setRoute,
    setCorporateBody,
    setFacility,
    setDescription,
    setBuilder,
    setWorksNumber,
    setImageNo,
    clearAllFilters,
    applyFilters,
    isLoading,
    error,
    filteredResults,
    hasActiveFilters,
    refreshFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook for using the filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};