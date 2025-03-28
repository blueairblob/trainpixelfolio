// GalleryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import GalleryHeader from '../components/GalleryHeader';
import CategoryFilter from '../components/CategoryFilter';
import FilterModal from '../components/FilterModal';
import PhotoList from '../components/PhotoList';
import SearchBar from '../components/SearchBar';
import { fetchCatalogPhotos, fetchPhotosByCategory, fetchCategories, CatalogPhoto, searchPhotos } from '../services/catalogService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { supabase } from '../services/supabase'; // Adjust the import based on your setup
import { cacheApiData, getCachedApiData } from '@/utils/imageCache';

const GalleryScreen = ({ navigation, route }) => {
  const [photos, setPhotos] = useState<CatalogPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<CatalogPhoto[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'single'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(route.params?.category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ id: string, title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [searchBarText, setSearchBarText] = useState('');

  const loadData = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    console.log(`loadData called: page=${pageNum}, isRefresh=${isRefresh}, activeCategory=${activeCategory}`);

    if ((isLoading || isLoadingMore) && !isRefresh) {
      console.log('Skipping loadData: already loading');
      return;
    }

    if (isRefresh) {
      console.log('Setting isRefreshing to true');
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      console.log('Setting isLoading to true for initial load');
      setIsLoading(true);
    } else {
      console.log('Setting isLoadingMore to true for pagination');
      setIsLoadingMore(true);
    }

    try {
      setError(null);

      // Fetch categories (only on initial load or refresh)
      if (pageNum === 1) {
        console.log('Fetching categories...');
        const categoryData = await fetchCategories();
        const formattedCategories = [
          { id: 'all', title: 'All Photos' },
          ...categoryData.map(category => ({ id: category, title: category }))
        ];
        setCategories(formattedCategories);
        console.log('Categories fetched:', formattedCategories);
      }

      // Skip loading photos if we're searching
      if (searchQuery) {
        console.log('Skipping loadData: search is active');
        return;
      }

      // Fetch photos
      console.log(`Fetching photos for page ${pageNum}...`);
      let photoData: CatalogPhoto[];
      if (activeCategory === 'all') {
        photoData = await fetchCatalogPhotos(pageNum, ITEMS_PER_PAGE);
      } else {
        photoData = await fetchPhotosByCategory(activeCategory, pageNum, ITEMS_PER_PAGE);
      }

      console.log(`Fetched ${photoData.length} photos for page ${pageNum}:`, photoData);

      if (pageNum === 1) {
        console.log('Setting photos for initial load:', photoData);
        setPhotos(photoData);
      } else {
        console.log('Appending photos for pagination:', photoData);
        setPhotos(prev => [...prev, ...photoData]);
      }

      if (photoData.length < ITEMS_PER_PAGE) {
        console.log('No more photos to load');
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Error loading gallery data:', err);
      setError('Failed to load photos. Pull down to retry.');
    } finally {
      console.log('Resetting loading states');
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      console.log(`Current state: photos.length=${photos.length}, filteredPhotos.length=${filteredPhotos.length}, hasMore=${hasMore}`);
    }
  }, [activeCategory, searchQuery]); // Include searchQuery to skip loading when searching



  // Initial load
  useEffect(() => {
    console.log('Initial useEffect triggered');
    setPage(1);
    setHasMore(true);
    loadData(1);

    // Prefetch page 2 in the background
    const prefetchNextPage = async () => {
      try {
        console.log('Prefetching next page of data');
        let photoData: CatalogPhoto[];
        if (activeCategory === 'all') {
          photoData = await fetchCatalogPhotos(2, ITEMS_PER_PAGE);
        } else {
          photoData = await fetchPhotosByCategory(activeCategory, 2, ITEMS_PER_PAGE);
        }
        
        // Data will be cached inside the fetch functions
        console.log(`Prefetched ${photoData.length} photos for next page`);
      } catch (error) {
        console.error('Error prefetching next page:', error);
      }
    };
    
    // Start prefetching after a short delay
    const prefetchTimeout = setTimeout(prefetchNextPage, 1000);
    return () => clearTimeout(prefetchTimeout);
  }, [activeCategory, loadData]);

  // Load more photos when reaching the end
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading || isSearching) {
      console.log('Skipping loadMore: no more photos, already loading, or searching');
      return;
    }

    const nextPage = page + 1;
    console.log(`loadMore triggered: moving to page ${nextPage}`);
    setPage(nextPage);
    loadData(nextPage);

    // Prefetch the page after next to stay ahead
    const prefetchFutureData = async () => {
      try {
        const futurePage = nextPage + 1;
        console.log(`Prefetching page ${futurePage} in background`);
        
        // Prefetch next data
        let photoData: CatalogPhoto[];
        if (activeCategory === 'all') {
          photoData = await fetchCatalogPhotos(futurePage, ITEMS_PER_PAGE);
        } else {
          photoData = await fetchPhotosByCategory(activeCategory, futurePage, ITEMS_PER_PAGE);
        }
        
        console.log(`Successfully prefetched ${photoData.length} items for page ${futurePage}`);
      } catch (error) {
        console.error('Error prefetching future page:', error);
      }
    };

    // Start prefetching in the background
    setTimeout(prefetchFutureData, 300);

  }, [page, hasMore, isLoadingMore, isLoading, isSearching, loadData, activeCategory]);

  // Debounce search to prevent rapid queries
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };


// Handler for search input
const handleSearch = useCallback((text: string) => {
  console.log('Search initiated for:', text);
  
  // Clear search state if the search text is empty
  if (!text.trim()) {
    console.log('Empty search, clearing search state');
    setSearchQuery('');
    setIsSearching(false);
    setIsSearchMode(false); // Clear search mode
    setIsLoading(true);
    loadData(1);
    return;
  }
  
  // Otherwise, proceed with search
  console.log(`Setting loading state for search: "${text}"`);
  setIsLoading(true);
  setSearchQuery(text);
  setIsSearchMode(true); // Set search mode flag
  
  // Immediate search instead of debounced for more predictable behavior
  const searchCacheKey = `search_${text.toLowerCase().trim()}`;
  
  // Try to get from cache
  getCachedApiData(searchCacheKey)
    .then((cachedResults) => {
      if (cachedResults) {
        console.log('Using cached search results');
        setPhotos(cachedResults);
        setFilteredPhotos(cachedResults);
        setHasMore(cachedResults.length >= ITEMS_PER_PAGE);
        setIsLoading(false);
        setIsSearching(false);
        return;
      }
      
      // If not in cache, perform the search
      console.log(`No cache found, searching for: "${text}"`);
      return searchPhotos(text, 1, ITEMS_PER_PAGE)
        .then(results => {
          console.log(`Search found ${results.length} results`);
          setPhotos(results);
          setFilteredPhotos(results);
          // Cache the search results
          cacheApiData(searchCacheKey, results, 15); // Cache for 15 minutes
          setHasMore(results.length >= ITEMS_PER_PAGE);
          return results;
        });
    })
    .catch(err => {
      console.error('Search error:', err);
      setError('Failed to search photos. Please try again.');
      setPhotos([]);
      setFilteredPhotos([]);
    })
    .finally(() => {
      console.log('Search completed, resetting loading state');
      setIsLoading(false);
      setIsSearching(false);
    });
}, [loadData]);

// Load more search results
const loadMoreSearchResults = useCallback(() => {
  if (!hasMore || isLoadingMore || isLoading) {
    console.log('Skipping loadMoreSearchResults: no more results, already loading');
    return;
  }
  
  console.log(`Loading more search results for query: "${searchQuery}", page: ${page + 1}`);
  setIsLoadingMore(true);
  
  searchPhotos(searchQuery, page + 1, ITEMS_PER_PAGE)
    .then(results => {
      console.log(`Got ${results.length} more search results`);
      if (results.length > 0) {
        // Append to existing results
        setPhotos(prev => [...prev, ...results]);
        setFilteredPhotos(prev => [...prev, ...results]);
      }
      setHasMore(results.length >= ITEMS_PER_PAGE);
      setPage(prev => prev + 1);
    })
    .catch(err => {
      console.error('Error loading more search results:', err);
      setError('Failed to load more search results');
    })
    .finally(() => {
      setIsLoadingMore(false);
    });
}, [searchQuery, page, isLoading, isLoadingMore, hasMore]);

  // Filter photos based on search query (only when not searching)
  useEffect(() => {
    if (isSearching) {
      console.log('Skipping client-side filtering: search is active');
      return;
    }
    console.log('Filtering photos based on searchQuery:', searchQuery);
    let result = photos;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(photo =>
        (photo.description?.toLowerCase().includes(query) || false) ||
        (photo.category?.toLowerCase().includes(query) || false) ||
        (photo.photographer?.toLowerCase().includes(query) || false) ||
        (photo.location?.toLowerCase().includes(query) || false)
      );
    }
    setFilteredPhotos(result);
    // console.log('Filtered photos:', result);
  }, [searchQuery, photos, isSearching]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    console.log('onRefresh triggered');
    setPage(1);
    setHasMore(true);
    if (searchQuery) {
      searchPhotos(searchQuery, 1);
    } else {
      loadData(1, true);
    }
  }, [loadData, searchQuery]);

  // Handle clearing search
  const handleClearSearch = useCallback(() => {
    console.log('Clearing search');
    setSearchQuery('');
    setIsSearchMode(false);
    setIsSearching(false);
    
    // Use the photos we already have instead of loading new ones
    // if (photos.length > 0) {
      setFilteredPhotos(photos);
    //   return;
    // }
    
    // Only load new data if we don't have any
    // setIsLoading(true);
    // loadData(1);
  }, [photos, loadData]);

  const handlePhotoPress = (id: string) => {
    console.log('Photo pressed:', id);
    navigation.navigate('PhotoDetail', { id });
  };

  const handleClearFilters = () => {
    console.log('Clearing filters');
    setActiveCategory('all');
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    loadData(1);
  };

  const handleEndReached = useCallback(() => {
    if (isSearchMode) {
      loadMoreSearchResults();
    } else {
      loadMore();
    }
  }, [isSearchMode, loadMoreSearchResults, loadMore]);

  const handleCategoryChange = async (category: string) => {
    console.log('Category changed to:', category);
    setActiveCategory(category);

    // Clear search query and state when changing categories
    setSearchQuery('');
    setIsSearchMode(false);
    setIsSearching(false);
    
    // Clear search query when changing categories, especially for "all" category
    if (category === 'all') {
      setSearchQuery('');
    }
    
    // Reset pagination
    setPage(1);
    setHasMore(true);
    
    // Clear photos to avoid showing old data
    setPhotos([]);
    setFilteredPhotos([]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Fetch photos based on category
      let photoData: CatalogPhoto[];
      if (category === 'all') {
        photoData = await fetchCatalogPhotos(1, ITEMS_PER_PAGE);
      } else {
        photoData = await fetchPhotosByCategory(category, 1, ITEMS_PER_PAGE);
      }
      
      // Update photos state
      setPhotos(photoData);
      setFilteredPhotos(photoData);
      setHasMore(photoData.length >= ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading category photos:', error);
      setError('Failed to load photos for this category. Pull down to retry.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isRefreshing) {
    console.log('Rendering loading state');
    return (
      <SafeAreaView style={styles.container}>
        <GalleryHeader
          onFilterPress={() => setFilterModalVisible(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const photoData = filteredPhotos.map(photo => ({
    id: photo.id || photo.image_no,
    title: photo.description || 'Untitled',
    photographer: photo.photographer || 'Unknown',
    price: 49.99,
    imageUrl: photo.image_url,
    location: photo.location || '',
    description: photo.description || ''
  }));

  //console.log('Rendering PhotoList with photoData:', photoData);
  console.log('Render state:', { 
    isLoading, 
    isRefreshing, 
    isLoadingMore, 
    isSearching,
    hasPhotos: photos.length > 0,
    hasFilteredPhotos: filteredPhotos.length > 0,
    searchQuery
  });

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
        initialValue={searchQuery}
      />
      <View style={styles.categoryContainer}>
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryChange}
          />
        )}
      </View>
      <PhotoList
        photos={photoData}
        viewMode={viewMode}
        onPhotoPress={handlePhotoPress}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          error && !isRefreshing ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4f46e5" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && filteredPhotos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? `No results found for "${searchQuery}"` : 'No photos available'}
              </Text>
            </View>
          ) : null
        }
      />
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryPress={handleCategoryChange}
        onClearFilters={handleClearFilters}
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
  }
});

export default GalleryScreen;