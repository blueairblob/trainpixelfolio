// GalleryScreen.tsx - Updated with consistent hook order to fix Rules of Hooks violation
import React, { useState, useEffect, useCallback } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import GalleryHeader from '../components/GalleryHeader';
import CategoryFilter from '../components/CategoryFilter';
import FilterModal from '../components/FilterModal';
import PhotoList from '../components/PhotoList';
import SearchBar from '../components/SearchBar';
import FilterDebugger from '../components/FilterDebugger';

// Import services and hooks
import { photoService } from '@/api/supabase';
import { Photo } from '@/api/supabase/types';

import { useSearch } from '../hooks/useSearch';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FilterProvider, useFilters } from '../context/FilterContext';

const GalleryScreen = ({ navigation, route }) => {
  // Extract params from route
  const initialCategory = route.params?.category || 'all';
  const initialSearchQuery = route.params?.searchQuery || '';
  const fromSearch = route.params?.fromSearch || false;

  // **** ALL HOOK DECLARATIONS MUST COME BEFORE ANY CONDITIONAL LOGIC ****
  
  // 1. Context hooks
  const { 
    filteredResults, 
    hasActiveFilters,
    clearAllFilters,
    refreshFilters,
    isLoading: isFilterLoading,
    error: filterError
  } = useFilters();
  
  const { isOffline } = useNetworkStatus();
  
  // 2. State hooks - declare all at the top, before any conditional logic
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'single'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<{ id: string, title: string }[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(fromSearch);
  const [totalPhotoCount, setTotalPhotoCount] = useState(0);
  
  // 3. Custom hooks
  const search = useSearch({
    initialQuery: fromSearch ? initialSearchQuery : '',
    itemsPerPage: 10
  });
  
  // 4. useEffect hooks
  // Navigation focus effect
  useFocusEffect(
    useCallback(() => {
      // Only reset if we're coming in with a new search query
      if (route.params?.searchQuery && fromSearch) {
        setIsSearchMode(true);
        search.setSearchQuery(route.params.searchQuery);
      }
      
      // Reset category if coming from a category selection
      if (route.params?.category && route.params.category !== activeCategory) {
        setActiveCategory(route.params.category);
        setIsSearchMode(false);
        setPage(1);
      }
      
      // Clear route params to prevent issues on re-focus
      if (route.params?.searchQuery || route.params?.category) {
        navigation.setParams({ 
          searchQuery: undefined, 
          category: undefined,
          fromSearch: undefined 
        });
      }
    }, [route.params, navigation, activeCategory, search])
  );

  // Load categories effect
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);

        const { data: categoryData, error } = await photoService.getCategories();
        if (error) throw error;
        const categories = categoryData || [];        
        
        // Map categories to the format our component expects
        const categoryIcons = {
          'steam': 'train',
          'modern': 'subway',
          'stations': 'business',
          'scenic': 'image',
          'historical': 'time',
          'passenger': 'people',
          'freight': 'cube',
          'railway': 'git-branch'
        };
        
        // Create formatted categories with icons
        const formattedCategories = [
          { id: 'all', title: 'All Photos' },
          ...categoryData.map(category => {
            // Use a matching icon if available, or a default icon
            const icon = categoryIcons[category.toLowerCase()] || 'image';
            return { id: category, title: category, icon };
          })
        ];
        
        // Limit to the first 8 categories for display
        setCategories(formattedCategories.slice(0, 8));
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Load photos effect
  useEffect(() => {
    if (isSearchMode) return; // Skip when in search mode
    
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let photoData;
        if (activeCategory === 'all') {
          const { data, error } = await photoService.getCatalogPhotos(
            { page: 1, limit: 10 }
          );
          if (error) throw error;
          photoData = data || [];
        } else {
          const { data, error } = await photoService.getPhotosByCategory(
            activeCategory, 
            { page: 1, limit: 10 }
          );
          if (error) throw error;
          photoData = data || [];
        }
        
        setPhotos(photoData);
        setHasMore(photoData.length >= 10);
        setPage(1);
      } catch (err) {
        console.error('Error loading photos:', err);
        setError('Failed to load photos. Pull down to retry.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhotos();
  }, [activeCategory, isSearchMode]);

  // Fetch total count effect
  useEffect(() => {
    fetchTotalPhotoCount();
  }, []);

  // 5. useCallback hooks - ALL declared before any conditional returns
  const fetchTotalPhotoCount = useCallback(async () => {
    try {
      const { data, error } = await photoService.getTotalPhotoCount();
      if (error) throw error;
      
      if (data !== null) {
        setTotalPhotoCount(data);
      }
    } catch (err) {
      console.error('Error fetching total photo count:', err);
    }
  }, []);
  
  const loadMore = useCallback(async () => {
    // Skip if we're in search mode, loading, or have no more items
    if (isSearchMode || isLoadingMore || !hasMore || hasActiveFilters) return;
    
    try {
      setIsLoadingMore(true);
      
      const nextPage = page + 1;
      let newPhotos: Photo[];
      
      if (activeCategory === 'all') {
        const { data, error } = await photoService.getCatalogPhotos({ 
          page: nextPage, 
          limit: 10 
        });
        if (error) throw error;
        newPhotos = data || [];
      } else {
        const { data, error } = await photoService.getPhotosByCategory(
          activeCategory, 
          { page: nextPage, limit: 10 }
        );
        if (error) throw error;
        newPhotos = data || [];
      }

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        setPage(nextPage);
        setHasMore(newPhotos.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more photos:', err);
      setError('Failed to load more photos');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isSearchMode, isLoadingMore, hasMore, page, activeCategory, hasActiveFilters]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      if (isSearchMode) {
        // Refresh search results
        search.setSearchQuery(search.query);
      } else if (hasActiveFilters) {
        // Call refreshFilters from the closure (not a new hook call)
        console.log('Refreshing with active filters');
        await refreshFilters();
      } else {
        // Regular refresh without filters
        let refreshedPhotos: Photo[];
        if (activeCategory === 'all') {
          const { data, error } = await photoService.getCatalogPhotos({ 
            page: 1, 
            limit: 10,
            useCache: false 
          });
          if (error) throw error;
          refreshedPhotos = data || [];
        } else {
          const { data, error } = await photoService.getPhotosByCategory(
            activeCategory, 
            { page: 1, limit: 10, useCache: false }
          );
          if (error) throw error;
          refreshedPhotos = data || [];
        }
        
        setPhotos(refreshedPhotos);
        setHasMore(refreshedPhotos.length >= 10);
        setPage(1);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing photos:', err);
      setError('Failed to refresh photos');
    } finally {
      setIsRefreshing(false);
    }
  }, [isSearchMode, activeCategory, search, hasActiveFilters, refreshFilters]);

  const handleSearch = useCallback((text: string) => {
    if (!text.trim()) {
      // Clear search
      setIsSearchMode(false);
      return;
    }
    
    // Activate search mode and execute search
    setIsSearchMode(true);
    search.setSearchQuery(text);
  }, [search]);

  const handleClearSearch = useCallback(() => {
    search.clearSearch();
    setIsSearchMode(false);
  }, [search]);

  const handleCategoryChange = useCallback((category: string) => {
    if (category === activeCategory) return;
    
    setActiveCategory(category);
    setIsSearchMode(false); // Exit search mode when changing category
    setPage(1);
    search.clearSearch();
    
    // Also clear any active filters when changing category
    if (hasActiveFilters) {
      clearAllFilters();
    }
  }, [activeCategory, search, hasActiveFilters, clearAllFilters]);

  const handlePhotoPress = useCallback((id: string) => {
    navigation.navigate('PhotoDetailScreen', { id });
  }, [navigation]);

  const handleEndReached = useCallback(() => {
    if (isSearchMode) {
      search.loadMore();
    } else if (!hasActiveFilters) {
      loadMore();
    }
    // We don't load more for filtered results yet
  }, [isSearchMode, search, loadMore, hasActiveFilters]);

  const handleApplyFilters = useCallback(() => {
    // When filters are applied, we want to exit search mode
    if (isSearchMode) {
      setIsSearchMode(false);
      search.clearSearch();
    }
    
    // Use refreshFilters from closure (not a new hook call)
    refreshFilters();
  }, [isSearchMode, search, refreshFilters]);

  // This function prepares the photo data for display
  const getPhotoDisplayData = useCallback(() => {
    // If we have active filters, use filteredResults instead of regular data
    if (hasActiveFilters && !isSearchMode) {
      console.log(`Using ${filteredResults.length} filtered results instead of regular data`);
      return filteredResults.map((photo, index) => ({
        id: `${photo.image_no}_${index}`, // Added index to ensure uniqueness
        originalId: photo.image_no, // Keep original ID for navigation
        title: photo.description || 'Untitled',
        photographer: photo.photographer || 'Unknown',
        // price: 0.50, // Default price (in a real app this would come from the API)
        imageUrl: photo.image_url || '',
        location: photo.location || '',
        description: photo.description || ''
      }));
    }
    
    // Otherwise use the original logic
    const sourcePhotos = isSearchMode ? search.results : photos;
    
    return sourcePhotos.map((photo, index) => ({
      id: `${photo.image_no}_${index}`, // Added index to ensure uniqueness
      originalId: photo.image_no, // Keep original ID for navigation
      title: photo.description || 'Untitled',
      photographer: photo.photographer || 'Unknown',
      price: 0.50, // Default price (in a real app this would come from the API)
      imageUrl: photo.image_url || '',
      location: photo.location || '',
      description: photo.description || ''
    }));
  }, [isSearchMode, search.results, photos, hasActiveFilters, filteredResults]);

  // Handle photo press using the data prepared by getPhotoDisplayData
  const handlePhotoItemPress = useCallback((id: string) => {
    // Find the photo with the compound ID and extract the original ID
    const photoData = getPhotoDisplayData();
    const photo = photoData.find(p => p.id === id);
    if (photo) {
      navigation.navigate('PhotoDetailScreen', { id: photo.originalId });
    }
  }, [getPhotoDisplayData, navigation]);

  // *** After all hooks are defined, we can have conditional logic ***

  // Get the photo data to display
  const photoData = getPhotoDisplayData();
  
  // Check for duplicate IDs and log them - debugging helper
  if (__DEV__) {
    const photoIds = photoData.map(p => p.id);
    const uniqueIds = new Set(photoIds);
    if (photoIds.length !== uniqueIds.size) {
      const duplicates = photoIds.filter((id, index) => photoIds.indexOf(id) !== index);
      console.warn('Duplicate photo IDs detected:', duplicates);
    }
  }
  
  // Determine if we should show error state
  const shouldShowError = isSearchMode 
    ? search.isError 
    : hasActiveFilters 
      ? filterError !== null 
      : error !== null;
  
  const errorMessage = isSearchMode 
    ? search.errorMessage 
    : hasActiveFilters 
      ? filterError 
      : error;

  // Determine loading state
  const isContentLoading = (isSearchMode 
    ? search.isLoading && !isRefreshing 
    : isLoading && !isRefreshing) || (hasActiveFilters && isFilterLoading && !isRefreshing);

  // Render loading state - moved after all hooks are defined
  if (isContentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <GalleryHeader
          onFilterPress={() => setFilterModalVisible(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <SearchBar 
          onSearch={handleSearch}
          onClear={handleClearSearch}
          initialValue={isSearchMode ? search.query : ''}
          executeOnChange={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <GalleryHeader
        onFilterPress={() => setFilterModalVisible(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <SearchBar 
        onSearch={handleSearch}
        onClear={handleClearSearch}
        initialValue={isSearchMode ? search.query : ''}
        executeOnChange={false}
      />
      
      {/* Category filter */}
      {!isSearchMode && !hasActiveFilters && (
        <View style={styles.categoryContainer}>
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryPress={handleCategoryChange}
            />
          )}
        </View>
      )}
      
      {/* Filter active indicator */}
      {hasActiveFilters && !isSearchMode && (
        <View style={styles.filtersActiveContainer}>
          <Text style={styles.filtersActiveText}>
            Filters applied
          </Text>
          <TouchableOpacity 
            onPress={clearAllFilters}
            style={styles.clearFiltersButton}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Search active indicator */}
      {isSearchMode && search.query && (
        <View style={styles.searchActiveContainer}>
          <View style={styles.searchInfoContainer}>
            <Text style={styles.searchActiveText}>
              Showing results for "{search.query}"
            </Text>
            <Text style={styles.resultCountText}>
              {search.results.length} {search.results.length === 1 ? 'result' : 'results'}
              {search.hasMore ? '+' : ''}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleClearSearch}
            style={styles.clearSearchButton}
          >
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Result count for regular browsing */}
      {!isSearchMode && !hasActiveFilters && photos.length > 0 && (
        <View style={styles.resultCountContainer}>
          <Text style={styles.resultCountText}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            {hasMore ? '+' : ''}
            {activeCategory !== 'all' && ` in "${categories.find(c => c.id === activeCategory)?.title || activeCategory}"`}
          </Text>
        </View>
      )}
      
      {/* Network offline indicator */}
      {isOffline && (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>
            You are offline. Some features may be limited.
          </Text>
        </View>
      )}
      
      {/* Photo list */}
      <PhotoList
        photos={photoData}
        viewMode={viewMode}
        onPhotoPress={handlePhotoItemPress} // Using the consistently defined hook
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          shouldShowError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          (isSearchMode 
            ? search.isLoading && !search.isError 
            : !hasActiveFilters && isLoadingMore) ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4f46e5" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isContentLoading && photoData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isSearchMode 
                  ? `No results found for "${search.query}"` 
                  : hasActiveFilters
                    ? 'No photos match the applied filters'
                    : 'No photos available'
                }
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity 
                  style={styles.clearFiltersEmptyButton}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.clearFiltersEmptyText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
      
      {/* Debug component (only in development mode) */}
      {/* {__DEV__ && <FilterDebugger />} */}
      
      {/* Advanced Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        resultCount={totalPhotoCount}
        hasMoreResults={hasMore}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  clearFiltersEmptyButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearFiltersEmptyText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  searchActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  filtersActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  searchInfoContainer: {
    flex: 1,
  },
  searchActiveText: {
    fontSize: 14,
    color: '#0369a1',
  },
  filtersActiveText: {
    fontSize: 14,
    color: '#0369a1',
  },
  clearSearchButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersButton: {
    paddingVertical: 4,
    paddingHorizontal: 8, 
  },
  clearSearchText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  offlineContainer: {
    padding: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 14,
    color: '#dc2626',
  },
  resultCountText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  resultCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});

// Wrap the main GalleryScreen component with FilterProvider
const GalleryScreenWithFilters = ({ navigation, route }) => (
  <FilterProvider>
    <GalleryScreen navigation={navigation} route={route} />
  </FilterProvider>
);

export default GalleryScreenWithFilters;