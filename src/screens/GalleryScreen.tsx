import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native';
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
  const [categories, setCategories] = useState<{id: string, title: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data function, now memoized with useCallback
  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch categories
      const categoryData = await fetchCategories();
      const formattedCategories = [
        { id: 'all', title: 'All Photos' },
        ...categoryData.map(category => ({ id: category, title: category }))
      ];
      setCategories(formattedCategories);
      
      // Fetch photos
      let photoData: CatalogPhoto[];
      if (activeCategory === 'all') {
        photoData = await fetchCatalogPhotos();
      } else {
        photoData = await fetchPhotosByCategory(activeCategory);
      }
      
      setPhotos(photoData);
      setFilteredPhotos(photoData);
    } catch (err) {
      console.error('Error loading gallery data:', err);
      setError('Failed to load photos. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeCategory]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  // Filter photos based on search query
  useEffect(() => {
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
  }, [searchQuery, photos]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handlePhotoPress = (id: string) => {
    navigation.navigate('PhotoDetail', { id });
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
  };

  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category);
  };

  if (isLoading && !isRefreshing) {
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
      <FlatList
        data={[{ key: 'photoList' }]} // Dummy data to render PhotoList once
        renderItem={() => (
          <PhotoList 
            photos={photoData}
            viewMode={viewMode}
            onPhotoPress={handlePhotoPress}
          />
        )}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        ListHeaderComponent={
          error && !isRefreshing ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.flatListContent}
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
  flatListContent: {
    flexGrow: 1,
  },
});

export default GalleryScreen;