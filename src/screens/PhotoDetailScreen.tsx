
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchPhotoById, getImageUrl } from '../services/catalogService';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const photoData = await fetchPhotoById(id);
        if (!photoData) {
          throw new Error('Photo not found');
        }
        
        setPhoto(photoData);
      } catch (err) {
        console.error('Error loading photo details:', err);
        setError('Failed to load photo details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhoto();
  }, [id]);
  
  const handleAddToCart = () => {
    // In a real implementation, this would add the photo to the cart in a state manager
    setIsInCart(true);
    Alert.alert('Added to Cart', 'This photo has been added to your cart.');
  };
  
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites', 
      isFavorite ? 'This photo has been removed from your favorites.' : 'This photo has been added to your favorites.'
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading photo details...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !photo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Photo not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          onPress={handleToggleFavorite} 
          style={styles.favoriteButton}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? '#ef4444' : '#374151'} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Photo Image */}
        <Image 
          source={{ uri: getImageUrl(photo.image_no) }}
          style={styles.photoImage}
          resizeMode="contain"
        />
        
        {/* Photo Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.photoTitle}>{photo.description || 'Untitled'}</Text>
          
          <View style={styles.photographerContainer}>
            <Text style={styles.photographerLabel}>Photographer:</Text>
            <Text style={styles.photographerName}>{photo.photographer || 'Unknown'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{photo.location || 'Unknown'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{photo.category || 'Uncategorized'}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date Taken</Text>
              <Text style={styles.detailValue}>
                {photo.date_taken 
                  ? new Date(photo.date_taken).toLocaleDateString() 
                  : 'Unknown'}
                {photo.circa ? ' (circa)' : ''}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Collection</Text>
              <Text style={styles.detailValue}>{photo.collection || 'General'}</Text>
            </View>
          </View>
          
          {photo.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{photo.description}</Text>
            </View>
          )}
          
          {/* Image Metadata */}
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataTitle}>Image Details</Text>
            
            <View style={styles.metadataGrid}>
              {photo.width && photo.height && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Dimensions</Text>
                  <Text style={styles.metadataValue}>{photo.width} x {photo.height}px</Text>
                </View>
              )}
              
              {photo.file_type && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>File Type</Text>
                  <Text style={styles.metadataValue}>{photo.file_type}</Text>
                </View>
              )}
              
              {photo.resolution && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Resolution</Text>
                  <Text style={styles.metadataValue}>{photo.resolution} DPI</Text>
                </View>
              )}
              
              {photo.colour_space && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Color Space</Text>
                  <Text style={styles.metadataValue}>{photo.colour_space}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Train Details */}
          {photo.gauge && (
            <View style={styles.trainDetailsContainer}>
              <Text style={styles.trainDetailsTitle}>Train Details</Text>
              
              <View style={styles.trainDetailItem}>
                <Text style={styles.trainDetailLabel}>Gauge:</Text>
                <Text style={styles.trainDetailValue}>{photo.gauge}</Text>
              </View>
              
              {photo.builders && photo.builders.length > 0 && (
                <View style={styles.trainDetailItem}>
                  <Text style={styles.trainDetailLabel}>Builder:</Text>
                  <Text style={styles.trainDetailValue}>
                    {photo.builders[0].builder_name}
                    {photo.builders[0].works_number ? ` (${photo.builders[0].works_number})` : ''}
                  </Text>
                </View>
              )}
              
              {photo.builders && photo.builders.length > 0 && photo.builders[0].year_built && (
                <View style={styles.trainDetailItem}>
                  <Text style={styles.trainDetailLabel}>Year Built:</Text>
                  <Text style={styles.trainDetailValue}>{photo.builders[0].year_built}</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Usage Rights */}
          <View style={styles.usageContainer}>
            <Text style={styles.usageTitle}>Usage Rights</Text>
            
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Prints Allowed:</Text>
              <View style={[
                styles.usageBadge, 
                photo.prints_allowed ? styles.allowedBadge : styles.notAllowedBadge
              ]}>
                <Text style={styles.usageBadgeText}>
                  {photo.prints_allowed ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Internet Use:</Text>
              <View style={[
                styles.usageBadge, 
                photo.internet_use ? styles.allowedBadge : styles.notAllowedBadge
              ]}>
                <Text style={styles.usageBadgeText}>
                  {photo.internet_use ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Publications Use:</Text>
              <View style={[
                styles.usageBadge, 
                photo.publications_use ? styles.allowedBadge : styles.notAllowedBadge
              ]}>
                <Text style={styles.usageBadgeText}>
                  {photo.publications_use ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Purchase button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>$49.99</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.purchaseButton, isInCart && styles.inCartButton]}
          onPress={handleAddToCart}
          disabled={isInCart}
        >
          <Text style={styles.purchaseButtonText}>
            {isInCart ? 'Added to Cart' : 'Add to Cart'}
          </Text>
          <Ionicons 
            name={isInCart ? 'checkmark-circle' : 'cart-outline'} 
            size={20} 
            color="#ffffff" 
            style={styles.purchaseButtonIcon} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    paddingBottom: 90,
  },
  photoImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f3f4f6',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  photoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  photographerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photographerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  photographerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  metadataContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataItem: {
    width: '50%',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  metadataValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  trainDetailsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  trainDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  trainDetailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  trainDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 90,
  },
  trainDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  usageContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  usageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  allowedBadge: {
    backgroundColor: '#d1fae5',
  },
  notAllowedBadge: {
    backgroundColor: '#fee2e2',
  },
  usageBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  inCartButton: {
    backgroundColor: '#10b981',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseButtonIcon: {
    marginLeft: 8,
  },
});

export default PhotoDetailScreen;
