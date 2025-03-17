
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedPhoto {
  id: string;
  title: string;
  description: string;
  photographer: string;
  location: string;
  price: number;
  imageUrl: string;
}

interface FeaturedPhotoSectionProps {
  featuredPhoto: FeaturedPhoto;
  onViewDetailsPress: (photoId: string) => void;
}

const FeaturedPhotoSection = ({ featuredPhoto, onViewDetailsPress }: FeaturedPhotoSectionProps) => {
  return (
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
            onPress={() => onViewDetailsPress(featuredPhoto.id)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default FeaturedPhotoSection;
