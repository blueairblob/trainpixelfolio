
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  // Featured categories
  const categories = [
    { id: 'steam', title: 'Steam Locomotives', icon: 'train-outline' },
    { id: 'modern', title: 'Modern Trains', icon: 'subway-outline' },
    { id: 'stations', title: 'Railway Stations', icon: 'business-outline' },
    { id: 'scenic', title: 'Scenic Railways', icon: 'image-outline' },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TrainPhoto</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Premium Train Photography</Text>
          <Text style={styles.welcomeText}>
            Discover our collection of high-quality train photographs from around the world
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Text style={styles.browseButtonText}>Browse Gallery</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Gallery', { category: category.id })}
              >
                <Ionicons name={category.icon} size={24} color="#4f46e5" />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Photo */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Photo</Text>
          <View style={styles.featuredCard}>
            <Image 
              source={{ uri: featuredPhoto.imageUrl }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#ffffff" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredPhoto.title}</Text>
              <Text style={styles.featuredDescription}>{featuredPhoto.description}</Text>
              <View style={styles.photographerRow}>
                <Text style={styles.photographerText}>By {featuredPhoto.photographer}</Text>
                <Text style={styles.locationText}>{featuredPhoto.location}</Text>
              </View>
              <View style={styles.featuredPrice}>
                <Text style={styles.priceText}>${featuredPhoto.price.toFixed(2)}</Text>
                <Text style={styles.licenseText}>Standard license</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => navigation.navigate('PhotoDetail', { id: featuredPhoto.id })}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  welcomeSection: {
    backgroundColor: '#4f46e5',
    padding: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#ebebff',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  browseButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  photographerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photographerText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  featuredPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  licenseText: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#4f46e5',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default HomeScreen;
