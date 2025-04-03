import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CatalogPhoto } from '@/services/catalogService';

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
}

// Define the context interface
interface FilterContextType {
  filters: FilterState;
  setOrganisation: (org: Organisation | null) => void;
  setLocation: (location: Location | null) => void;
  setPhotographer: (photographer: Photographer | null) => void;
  setCollection: (collection: Collection | null) => void;
  setDateRange: (range: DateRange | null) => void;
  setGauge: (gauge: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
  applyFilters: (baseQuery: any) => any; // Returns a modified query
  isLoading: boolean;
  error: string | null;
  filteredResults: CatalogPhoto[];
  hasActiveFilters: boolean;
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
};

// Provider component
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<CatalogPhoto[]>([]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.organisation ||
    filters.location ||
    filters.photographer ||
    filters.collection ||
    filters.dateRange ||
    filters.gauge ||
    filters.searchQuery
  );

  // Filter setters
  const setOrganisation = (org: Organisation | null) => {
    console.log('Setting organisation filter:', org);
    setFilters((prev) => ({ ...prev, organisation: org }));
  };

  const setLocation = (location: Location | null) => {
    setFilters((prev) => ({ ...prev, location }));
  };

  const setPhotographer = (photographer: Photographer | null) => {
    setFilters((prev) => ({ ...prev, photographer }));
  };

  const setCollection = (collection: Collection | null) => {
    setFilters((prev) => ({ ...prev, collection }));
  };

  const setDateRange = (range: DateRange | null) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  };

  const setGauge = (gauge: string | null) => {
    setFilters((prev) => ({ ...prev, gauge }));
  };

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setFilters(initialFilterState);
  };

  // Apply filters to a query
  const applyFilters = useCallback((baseQuery: any) => {
    let query = baseQuery;
    console.log('Starting to apply filters to query');

    // Apply organisation filter with better handling
    if (filters.organisation) {
      console.log(`Filtering by organisation: ${JSON.stringify(filters.organisation)}`);
      
      // Try case-insensitive match instead of exact match
      // This helps if there are case differences between the filter and database
      query = query.ilike('organisation', filters.organisation.name);
      
      // Log the SQL that would be generated (approximation)
      console.log(`SQL (approx): WHERE organisation ILIKE '${filters.organisation.name}'`);
    }

    // Apply location filter
    if (filters.location) {
      console.log(`Filtering by location: ${filters.location.name}`);
      query = query.ilike('location', filters.location.name);
    }

    // Apply photographer filter
    if (filters.photographer) {
      console.log(`Filtering by photographer: ${filters.photographer.name}`);
      query = query.ilike('photographer', filters.photographer.name);
    }

    // Apply collection filter
    if (filters.collection) {
      console.log(`Filtering by collection: ${filters.collection.name}`);
      query = query.ilike('collection', filters.collection.name);
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
      let query = supabase
        .from('mobile_catalog_view')
        .select('*')
        .order('date_taken', { ascending: false });

      // Apply all the filters
      console.log('Applying filters to Supabase query...');
      query = applyFilters(query);
      
      // Limit results for performance
      query = query.limit(50);

      console.log('Executing Supabase query...');
      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Supabase query error:', queryError);
        throw queryError;
      }

      // Process and set the results
      const results = data || [];
      console.log(`Query returned ${results.length} results`);
      
      setFilteredResults(results.map(item => ({
        ...item,
        id: item.image_no, // Ensure id is set for compatibility
        image_url: getImageUrl(item.image_no)
      })));

    } catch (err) {
      console.error('Error executing filtered query:', err);
      setError('Failed to apply filters');
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [applyFilters, hasActiveFilters, filters]);

  // Function to generate image URLs (copied from catalogService)
  const getImageUrl = (imageNo: string): string => {
    // Normalize the image_no by removing spaces to match the file name format
    const normalizedImageNo = imageNo.replace(/\s/g, '');
    const url = supabase.storage.from('picaloco').getPublicUrl(`images/${normalizedImageNo}.webp`).data.publicUrl;
    return url;
  };

  // Execute query when filters change
  React.useEffect(() => {
    executeFilteredQuery();
  }, [executeFilteredQuery]);

  const value = {
    filters,
    setOrganisation,
    setLocation,
    setPhotographer,
    setCollection,
    setDateRange,
    setGauge,
    setSearchQuery,
    clearAllFilters,
    applyFilters,
    isLoading,
    error,
    filteredResults,
    hasActiveFilters
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