// src/hooks/useSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { searchPhotos } from '@/services/catalogService';
import { CatalogPhoto } from '@/services/catalogService';

export interface SearchState {
  query: string;
  results: CatalogPhoto[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasMore: boolean;
  page: number;
}

export interface UseSearchOptions {
  initialQuery?: string;
  itemsPerPage?: number;
  cacheResults?: boolean;
  cacheDuration?: number; // minutes
}

/**
 * Custom hook for handling search functionality
 */
export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    initialQuery = '',
    itemsPerPage = 10,
    cacheResults = true,
    cacheDuration = 15
  } = options;

  const [state, setState] = useState<SearchState>({
    query: initialQuery,
    results: [],
    isLoading: false,
    isError: false,
    errorMessage: null,
    hasMore: true,
    page: 1
  });

  // Execute search
  const executeSearch = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setState(prev => ({
        ...prev,
        query: '',
        results: [],
        isLoading: false,
        isError: false,
        errorMessage: null,
        page: 1
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      errorMessage: null
    }));

    try {
      // Using the catalogService's searchPhotos function
      const results = await searchPhotos(
        searchQuery, 
        page, 
        itemsPerPage, 
        { useCache: cacheResults, cacheDuration }
      );

      if (page === 1) {
        // New search, replace all results
        setState(prev => ({
          ...prev,
          query: searchQuery,
          results,
          isLoading: false,
          hasMore: results.length >= itemsPerPage,
          page
        }));
      } else {
        // Load more, append to existing results
        setState(prev => ({
          ...prev,
          results: [...prev.results, ...results],
          isLoading: false,
          hasMore: results.length >= itemsPerPage,
          page
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  }, [itemsPerPage, cacheResults, cacheDuration]);

  // Set search query and execute search
  const setSearchQuery = useCallback((query: string) => {
    if (query === state.query) return;
    executeSearch(query, 1);
  }, [state.query, executeSearch]);

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoading) return;
    executeSearch(state.query, state.page + 1);
  }, [state.hasMore, state.isLoading, state.query, state.page, executeSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState({
      query: '',
      results: [],
      isLoading: false,
      isError: false,
      errorMessage: null,
      hasMore: true,
      page: 1
    });
  }, []);

  // Initialize with initial query if provided
  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, 1);
    }
  }, [initialQuery, executeSearch]);

  return {
    ...state,
    setSearchQuery,
    loadMore,
    clearSearch
  };
};