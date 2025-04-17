// GalleryScreen.tsx
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
import { 
  fetchCatalogPhotos, 
  fetchPhotosByCategory,
  fetchCategories,
  CatalogPhoto 
} from '../services/catalogService';
import { useSearch } from '../hooks/useSearch';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FilterProvider, useFilters } from '../context/FilterContext';

const GalleryScreen = ({ navigation, route }) => {
  // Extract params from route
  const initialCategory = route.params?.category || 'all';
  const initialSearchQuery = route.params?.searchQuery || '';
  const fromSearch = route.params?.fromSearch || false;

  // Extract filter context at top level (Correctly following Rules of Hooks)
  const { 
    filteredResults, 
    hasActiveFilters,
    clearAllFilters,
    refreshFilters,
    isLoading: isFilterLoading,
    error: filterError
  } = useFilters();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'single'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<{ id: string, title: string }[]>([]);
  const [photos, setPhotos] = useState<CatalogPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Network status
  const { isOffline } = useNetworkStatus();
  
  // Search hook
  const search = useSearch({
    initialQuery: fromSearch ? initialSearchQuery : '',
    itemsPerPage: 10
  });
  
  // Track if we're in search mode
  const [isSearchMode, setIsSearchMode] = useState(fromSearch);

  // Reset on navigation focus
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

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchCategories();
        const formattedCategories = [
          { id: 'all', title: 'All Photos' },
          ...categoryData.map(category => ({ id: category, title: category }))
        ];
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };
    
    loadCategories();
  }, []);

  // Load photos based on active category (not in search mode)
  useEffect(() => {
    if (isSearchMode) return; // Skip when in search mode
    
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let photoData: CatalogPhoto[];
        if (activeCategory === 'all') {
          photoData = await fetchCatalogPhotos(1);
        } else {
          photoData = await fetchPhotosByCategory(activeCategory, 1);
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

  // Load more photos (pagination)
  const loadMore = useCallback(async () => {
    // Skip if we're in search mode, loading, or have no more items
    if (isSearchMode || isLoadingMore || !hasMore || hasActiveFilters) return;
    
    try {
      setIsLoadingMore(true);
      
      const nextPage = page + 1;
      let newPhotos: CatalogPhoto[];
      
      if (activeCategory === 'all') {
        newPhotos = await fetchCatalogPhotos(nextPage);
      } else {
        newPhotos = await fetchPhotosByCategory(activeCategory, nextPage);
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

  // Handle refresh - FIXED to use refreshFilters from closure
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      if (isSearchMode) {
        // Refresh search results
        search.setSearchQuery(search.query);
      } else if (hasActiveFilters) {
        // Call refreshFilters from the closure (not a new hook call)
        console.log('Refreshing with active filters');
        refreshFilters();
      } else {
        // Regular refresh without filters
        let refreshedPhotos: CatalogPhoto[];
        if (activeCategory === 'all') {
          refreshedPhotos = await fetchCatalogPhotos(1, 10, { useCache: false });
        } else {
          refreshedPhotos = await fetchPhotosByCategory(activeCategory, 1, 10, { useCache: false });
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

  // Handle search
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

  // Handle clearing search
  const handleClearSearch = useCallback(() => {
    search.clearSearch();
    setIsSearchMode(false);
  }, [search]);

  // Handle category change
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

  // Handle photo press
  const handlePhotoPress = useCallback((id: string) => {
    navigation.navigate('PhotoDetailScreen', { id });
  }, [navigation]);

  // Handle end reached (for pagination)
  const handleEndReached = useCallback(() => {
    if (isSearchMode) {
      search.loadMore();
    } else if (!hasActiveFilters) {
      loadMore();
    }
    // We don't load more for filtered results yet
  }, [isSearchMode, search, loadMore, hasActiveFilters]);

  // Handle filter apply
  const handleApplyFilters = useCallback(() => {
    // When filters are applied, we want to exit search mode
    if (isSearchMode) {
      setIsSearchMode(false);
      search.clearSearch();
    }
    
    // Use refreshFilters from closure (not a new hook call)
    refreshFilters();
    
  }, [isSearchMode, search, refreshFilters]);

  // Create photo display data
  const getPhotoDisplayData = useCallback(() => {
    // If we have active filters, use filteredResults instead of regular data
    if (hasActiveFilters && !isSearchMode) {
      console.log(`Using ${filteredResults.length} filtered results instead of regular data`);
      return filteredResults.map(photo => ({
        id: photo.image_no,
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
    
    return sourcePhotos.map(photo => ({
      id: photo.image_no,
      title: photo.description || 'Untitled',
      photographer: photo.photographer || 'Unknown',
      price: 0.50, // Default price (in a real app this would come from the API)
      imageUrl: photo.image_url || '',
      location: photo.location || '',
      description: photo.description || ''
    }));
  }, [isSearchMode, search.results, photos, hasActiveFilters, filteredResults]);

  // Determine loading state
  const isContentLoading = (isSearchMode 
    ? search.isLoading && !isRefreshing 
    : isLoading && !isRefreshing) || (hasActiveFilters && isFilterLoading && !isRefreshing);

  // Render loading state
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

  // Get the photo data to display
  const photoData = getPhotoDisplayData();
  
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
        onPhotoPress={handlePhotoPress}
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
            </View>
          ) : null
        }
      />
      
      {/* Debug component (only in development mode) */}
      {__DEV__ && <FilterDebugger />}
      
      {/* Advanced Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        resultCount={photoData.length}
        hasMoreResults={isSearchMode ? search.hasMore : hasMore}
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