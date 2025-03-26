import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import GalleryHeader from '../components/GalleryHeader';
import CategoryFilter from '../components/CategoryFilter';
import FilterModal from '../components/FilterModal';
import PhotoList from '../components/PhotoList';
import SearchBar from '../components/SearchBar';
import { fetchCatalogPhotos, fetchPhotosByCategory, fetchCategories, CatalogPhoto } from '../services/catalogService';

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

  const ITEMS_PER_PAGE = 20;

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
  }, [activeCategory]); // Removed isLoading, isLoadingMore, photos, filteredPhotos from dependencies

  // Initial load
  useEffect(() => {
    console.log('Initial useEffect triggered');
    setPage(1);
    setHasMore(true);
    loadData(1);
  }, [activeCategory, loadData]); // Ensure this runs when activeCategory changes

  // Load more photos when reaching the end
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) {
      console.log('Skipping loadMore: no more photos or already loading');
      return;
    }
    const nextPage = page + 1;
    console.log(`loadMore triggered: moving to page ${nextPage}`);
    setPage(nextPage);
    loadData(nextPage);
  }, [page, hasMore, isLoadingMore, isLoading, loadData]);

  // Filter photos based on search query
  useEffect(() => {
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
    console.log('Filtered photos:', result);
  }, [searchQuery, photos]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    console.log('onRefresh triggered');
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  }, [loadData]);

  const handleSearch = (text: string) => {
    console.log('Search query updated:', text);
    setSearchQuery(text);
  };

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
    loadData(1);
  };

  const handleCategoryChange = async (category: string) => {
    console.log('Category changed to:', category);
    setActiveCategory(category);
    setPage(1);
    setHasMore(true);
    setPhotos([]); // Clear photos to avoid showing old data
    setFilteredPhotos([]);
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

  console.log('Rendering PhotoList with photoData:', photoData);

  return (
    <SafeAreaView style={styles.container}>
      <GalleryHeader
        onFilterPress={() => setFilterModalVisible(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <SearchBar onSearch={handleSearch} />
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
        onEndReached={loadMore}
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
});

export default GalleryScreen;