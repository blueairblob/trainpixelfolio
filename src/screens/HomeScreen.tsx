
// HomeScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components
import HeaderSection from '../components/HeaderSection';
import WelcomeSection from '../components/WelcomeSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedPhotoSection from '../components/FeaturedPhotoSection';
import SearchBar from '../components/SearchBar';

const HomeScreen = ({ navigation }) => {
  // Featured categories
  const categories = [
    { id: 'steam', title: 'Steam Locomotives', icon: 'train' },
    { id: 'modern', title: 'Modern Trains', icon: 'subway' },
    { id: 'stations', title: 'Railway Stations', icon: 'business' },
    { id: 'scenic', title: 'Scenic Railways', icon: 'image' },
  ];

  // Sample featured photo
  const featuredPhoto = {
    id: 'featured1',
    title: 'Vintage Steam Engine',
    description: 'A beautifully restored steam locomotive passing through mountain scenery.',
    photographer: 'John Smith',
    location: 'Swiss Alps',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  };

  const handleSearch = (text) => {
    // Navigate to Gallery with search query
    navigation.navigate('Gallery', { searchQuery: text });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderSection 
          onCartPress={() => navigation.navigate('Cart')} 
        />
        
        {/* Add SearchBar at the top of the ScrollView */}
        <View style={styles.searchContainer}>
          <SearchBar onSearch={handleSearch} />
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
