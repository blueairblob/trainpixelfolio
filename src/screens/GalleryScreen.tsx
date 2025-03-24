
// GalleryScreen.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);

  // Load photos and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
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
        setError('Failed to load photos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [activeCategory]);

  // Filter photos based on selected category and search query
  useEffect(() => {
    let result = photos;
    
    // Apply search filter
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

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Navigate to photo detail
  const handlePhotoPress = (id: string) => {
    navigation.navigate('PhotoDetail', { id });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
  };

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <GalleryHeader 
          onFilterPress={() => setFilterModalVisible(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <GalleryHeader 
        onFilterPress={() => setFilterModalVisible(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Category Filters with fixed width */}
      <View style={styles.categoryContainer}>
        {categories.length > 0 && (
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryChange}
          />
        )}
      </View>

      {/* Photo List */}
      <PhotoList 
        photos={filteredPhotos.map(photo => ({
          id: photo.image_no,
          title: photo.description || 'Untitled',
          photographer: photo.photographer || 'Unknown',
          price: 49.99, // Default price since it's not in the database
          imageUrl: photo.thumbnail_url,
          location: photo.location || '',
          description: photo.description || ''
        }))}
        viewMode={viewMode}
        onPhotoPress={handlePhotoPress}
      />

      {/* Filter Modal */}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});

export default GalleryScreen;
