// GalleryScreen.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList } from 'react-native';
import { allPhotos } from '../services/photoService'; // Removed .ts extension
import GalleryHeader from '../components/GalleryHeader';
import CategoryFilter from '../components/CategoryFilter';
import FilterModal from '../components/FilterModal';
import PhotoList from '../components/PhotoList';
import SearchBar from '../components/SearchBar';

// Placeholder for now - we'll replace with a native version of our filter functionality
const GalleryScreen = ({ navigation, route }) => {
  const [photos, setPhotos] = useState(allPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState(allPhotos);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'single'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(route.params?.category || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories for filter with fixed width layout
  const categories = [
    { id: 'all', title: 'All Photos' },
    { id: 'steam', title: 'Steam Locomotives' },
    { id: 'modern', title: 'Modern Trains' },
    { id: 'stations', title: 'Railway Stations' },
    { id: 'scenic', title: 'Scenic Railways' },
  ];

  // Filter photos based on selected category and search query
  useEffect(() => {
    let result = photos;
    
    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(photo => photo.tags.includes(activeCategory));
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(photo => 
        photo.title.toLowerCase().includes(query) || 
        photo.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPhotos(result);
  }, [activeCategory, searchQuery, photos]);

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
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryFilter 
              categories={categories}
              activeCategory={activeCategory}
              onCategoryPress={setActiveCategory}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          style={styles.categoryList}
        />
      </View>

      {/* Photo List */}
      <PhotoList 
        photos={filteredPhotos}
        viewMode={viewMode}
        onPhotoPress={handlePhotoPress}
      />

      {/* Filter Modal */}
      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryPress={setActiveCategory}
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
  categoryList: {
    paddingVertical: 8,
  },
});

export default GalleryScreen;
