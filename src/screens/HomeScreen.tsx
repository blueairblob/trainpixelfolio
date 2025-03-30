// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Import components
import HeaderSection from '../components/HeaderSection';
import WelcomeSection from '../components/WelcomeSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedPhotoSection from '../components/FeaturedPhotoSection';
import SearchBar from '../components/SearchBar';
import { fetchCategories } from '../services/catalogService';

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([
    { id: 'steam', title: 'Steam Locomotives', icon: 'train' },
    { id: 'modern', title: 'Modern Trains', icon: 'subway' },
    { id: 'stations', title: 'Railway Stations', icon: 'business' },
    { id: 'scenic', title: 'Scenic Railways', icon: 'image' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample featured photo (this could come from an API in a real app)
  const featuredPhoto = {
    id: 'featured1',
    title: 'Vintage Steam Engine',
    description: 'A beautifully restored steam locomotive passing through mountain scenery.',
    photographer: 'John Smith',
    location: 'Swiss Alps',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  };

  // Load categories from the API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categoryData = await fetchCategories();
        
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
        const formattedCategories = categoryData.map(category => {
          // Use a matching icon if available, or a default icon
          const icon = categoryIcons[category.toLowerCase()] || 'image';
          return { id: category, title: category, icon };
        });
        
        // Limit to the first 8 categories for display
        setCategories(formattedCategories.slice(0, 8));
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Keep default categories on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Handle search
  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return;
    
    // Navigate to Gallery with search query
    navigation.navigate('Gallery', { 
      searchQuery: searchText,
      fromSearch: true // Flag to indicate this is from search
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderSection 
          onCartPress={() => navigation.navigate('Cart')} 
        />
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search train photographs..."
            executeOnChange={false} // Only search when submitted
          />
        </View>
        
        <WelcomeSection 
          onBrowsePress={() => navigation.navigate('Gallery')} 
        />
        
        <CategoriesSection 
          categories={categories}
          onCategoryPress={(categoryId) => navigation.navigate('Gallery', { category: categoryId })}
        />
        
        <FeaturedPhotoSection
          featuredPhoto={featuredPhoto}
          onViewDetailsPress={(photoId) => navigation.navigate('PhotoDetail', { id: photoId })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});

export default HomeScreen;