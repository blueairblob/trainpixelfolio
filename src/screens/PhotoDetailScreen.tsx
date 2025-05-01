// src/screens/PhotoDetailScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { photoService } from '@/api/supabase';
import { Photo } from '@/api/supabase/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the CartContext hook
  const { items, addToCart } = useCart();
  
  // Check if the current photo is in the cart
  const isInCart = items.some(item => item.id === id);
  
  const { 
    isGuest, 
    isAdmin,
    addFavorite, 
    removeFavorite, 
    isFavorite
  } = useAuth();
  
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  
  // Load photo and check if it's in favorites
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: photoData, error } = await photoService.getPhotoById(id);

        if (!photoData) {
          throw new Error('Photo not found');
        }
        
        setPhoto(photoData);
        
        // Check if this photo is in favorites
        setIsFavoriteState(isFavorite(id));
      } catch (err) {
        console.error('Error loading photo details:', err);
        setError('Failed to load photo details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhoto();
  }, [id, isFavorite]);
  
  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    try {
      if (isGuest) {
        Alert.alert(
          "Guest Mode",
          "Please sign in to purchase photos.",
          [{ text: "OK" }]
        );
        return;
      }
      
      if (!photo) return;
      
      // Create a properly formatted cart item from the photo
      // Make sure the price is set to a default value if undefined
      const cartItem = {
        ...photo,
        id: photo.image_no,
        price: 0.50, // Set a default price of £0.50
        title: photo.description || 'Untitled Photo',
        imageUrl: photo.image_url
      };
      
      // Use the addToCart from CartContext
      addToCart(cartItem);
      Alert.alert('Success', 'Added to cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Failed to add to cart');
    }
  }, [photo, isGuest, addToCart]);


  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async () => {
    try {
      // Make sure we're using image_no as the ID for favorites
      const favoriteId = photo.image_no;
      
      console.log(`Toggle favorite for photo ${favoriteId}`);
      
      if (isFavoriteState) {
        await removeFavorite(favoriteId);
        setIsFavoriteState(false);
      } else {
        await addFavorite(favoriteId);
        setIsFavoriteState(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorites');
    }
  }, [photo, isFavoriteState, addFavorite, removeFavorite]);

  // Load photo and check if it's in favorites
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: photoData, error } = await photoService.getPhotoById(id);

        if (!photoData) {
          throw new Error('Photo not found');
        }
        
        setPhoto(photoData);
        
        // Check if this photo is in favorites using image_no
        setIsFavoriteState(isFavorite(photoData.image_no));
      } catch (err) {
        console.error('Error loading photo details:', err);
        setError('Failed to load photo details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhoto();
  }, [id, isFavorite]);

  // Navigate to the AdminScreen with the photo to edit
  const handleEditPhoto = useCallback(() => {
    if (!isAdmin || !photo) return;
    
    // Log what we're working with
    console.log('Photo object for editing:', {
      id: photo.id,
      image_no: photo.image_no
    });
    
    // Just pass the image_no - the photoAdminService will handle finding the UUID
    navigation.navigate('AdminScreen', {
      initialTab: 'upload',
      photoToEdit: {
        ...photo,
        // Just pass the image_no - the admin service will look it up
        id: photo.image_no 
      }
    });
  }, [isAdmin, photo, navigation]);

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
        <Text style={styles.headerTitle}>Photo Details</Text>
        <View style={styles.headerActions}>
          {/* Edit button for admins */}
          {isAdmin && (
            <TouchableOpacity 
              onPress={handleEditPhoto} 
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={24} color="#374151" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleToggleFavorite} 
            style={styles.favoriteButton}
          >
            <Ionicons 
              name={isFavoriteState ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isFavoriteState ? '#ef4444' : '#374151'} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Photo Image */}
        <Image 
          source={{ uri: photo.image_url }}
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
          <Text style={styles.price}>£0.50</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.purchaseButton, 
            isInCart && styles.inCartButton,
            isGuest && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={isInCart || isGuest}
        >
          <Text style={styles.purchaseButtonText}>
            {isInCart 
              ? 'Added to Cart' 
              : isGuest 
                ? 'Sign In to Purchase' 
                : 'Add to Cart'
            }
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  content: {
    paddingBottom: 90, // Add padding for footer
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
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseButtonIcon: {
    marginLeft: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhotoDetailScreen;