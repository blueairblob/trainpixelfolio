import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, FlatList, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { allPhotos } from '../../services/photoService.ts';
import GalleryHeader from '../components/GalleryHeader';
import CategoryFilter from '../components/CategoryFilter';
import FilterModal from '../components/FilterModal';
import PhotoList from '../components/PhotoList';

const GalleryScreen = ({ navigation }) => {
  const route = useRoute();
  const initialCategory = route.params?.category || 'all';
  
  const [photos, setPhotos] = useState(allPhotos);
  const [viewMode, setViewMode] = useState('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(false);

  // Categories for filter
  const categories = [
    { id: 'all', title: 'All Photos' },
    { id: 'steam', title: 'Steam Locomotives' },
    { id: 'modern', title: 'Modern Trains' },
    { id: 'stations', title: 'Railway Stations' },
    { id: 'scenic', title: 'Scenic Railways' },
  ];

  // Filter photos based on selected category
  const filteredPhotos = activeCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.tags.includes(activeCategory));

  // Navigate to photo detail
  const handlePhotoPress = (id) => {
    navigation.navigate('PhotoDetail', { id });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveCategory('all');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <GalleryHeader 
        onFilterPress={() => setFilterModalVisible(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Category Filters */}
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryPress={setActiveCategory}
      />

      {/* Photo List */}
      <PhotoList 
        photos={filteredPhotos}
        viewMode={viewMode}
        onPhotoPress={handlePhotoPress}
        isLoading={isLoading}
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
});

export default GalleryScreen;
