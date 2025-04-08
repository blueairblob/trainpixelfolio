import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchPhotoById } from '@/services/catalogService';
import { addToCart } from '@/services/cartService';
import { addToFavorites, removeFromFavorites } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isGuest } = useAuth();

  // Fetch photo details
  useEffect(() => {
    const loadPhoto = async () => {
      try {
        setIsLoading(true);
        const photoData = await fetchPhotoById(id);
        setPhoto(photoData);
      } catch (err) {
        console.error('Error loading photo:', err);
        setError('Failed to load photo details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPhoto();
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      if (isGuest) {
        Alert.alert(
          "Guest Mode",
          "Please sign in to purchase photos.",
          [{ text: "OK" }]
        );
        return;
      }
      
      await addToCart(photo);
      Alert.alert('Success', 'Added to cart');
    } catch (err) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
      } else {
        await addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading photo details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo #{photo?.image_no}</Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ef4444" : "#374151"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: photo?.thumbnail_url || 'https://placehold.co/600x400?text=Image+Not+Available' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Photo Information */}
        <View style={styles.infoSection}>
          <Text style={styles.photoTitle}>{photo?.description || 'Untitled'}</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Photographer:</Text>
            <Text style={styles.infoValue}>{photo?.photographer || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{photo?.location || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{photo?.category || 'Uncategorized'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {photo?.date_taken 
                  ? new Date(photo?.date_taken).toLocaleDateString()
                  : 'Unknown'}
                {photo?.circa ? ' (circa)' : ''}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Collection:</Text>
              <Text style={styles.infoValue}>{photo?.collection || 'N/A'}</Text>
            </View>
          </View>

          {photo?.description && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{photo?.description}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.sectionTitle}>Technical Details</Text>
            
            {photo?.width && photo?.height && (
              <View style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>Dimensions:</Text>
                <Text style={styles.technicalValue}>{photo?.width} × {photo?.height} px</Text>
              </View>
            )}
            
            {photo?.file_type && (
              <View style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>File Type:</Text>
                <Text style={styles.technicalValue}>{photo?.file_type}</Text>
              </View>
            )}
            
            {photo?.resolution && (
              <View style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>Resolution:</Text>
                <Text style={styles.technicalValue}>{photo?.resolution} dpi</Text>
              </View>
            )}
            
            {photo?.colour_space && (
              <View style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>Color Space:</Text>
                <Text style={styles.technicalValue}>{photo?.colour_space}</Text>
              </View>
            )}
          </View>

          {photo?.gauge && (
            <View style={styles.infoItem}>
              <Text style={styles.sectionTitle}>Train Details</Text>
              
              <View style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>Gauge:</Text>
                <Text style={styles.technicalValue}>{photo?.gauge}</Text>
              </View>
              
              {photo?.builders && photo?.builders.length > 0 && (
                <View style={styles.technicalItem}>
                  <Text style={styles.technicalLabel}>Builder:</Text>
                  <Text style={styles.technicalValue}>
                    {photo?.builders.length > 0 
                      ? photo?.builders[0].builder_name 
                      : 'Unknown'}
                  </Text>
                </View>
              )}
              
              {photo?.builders && photo?.builders.length > 0 && photo?.builders[0].works_number && (
                <View style={styles.technicalItem}>
                  <Text style={styles.technicalLabel}>Works Number:</Text>
                  <Text style={styles.technicalValue}>{photo?.builders[0].works_number}</Text>
                </View>
              )}
            </View>
          )}

          {/* Usage Information */}
          <View style={styles.infoItem}>
            <Text style={styles.sectionTitle}>Usage Rights</Text>
            
            <View style={styles.usageContainer}>
              <Text style={styles.usageLabel}>Prints allowed:</Text>
              <View style={styles.usageValue}>
                <Ionicons 
                  name={photo?.prints_allowed ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={photo?.prints_allowed ? "#10b981" : "#ef4444"} 
                />
              </View>
            </View>
            
            <View style={styles.usageContainer}>
              <Text style={styles.usageLabel}>Internet use:</Text>
              <View style={styles.usageValue}>
                <Ionicons 
                  name={photo?.internet_use ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={photo?.internet_use ? "#10b981" : "#ef4444"} 
                />
              </View>
            </View>
            
            <View style={styles.usageContainer}>
              <Text style={styles.usageLabel}>Publications use:</Text>
              <View style={styles.usageValue}>
                <Ionicons 
                  name={photo?.publications_use ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={photo?.publications_use ? "#10b981" : "#ef4444"} 
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.purchaseContainer}>
        <TouchableOpacity 
          style={[styles.purchaseButton, isGuest && styles.purchaseButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isGuest}
        >
          <Text style={styles.purchaseButtonText}>
            {isGuest ? 'Sign In to Purchase' : 'Add to Cart'}
          </Text>
          
          {!isGuest && (
            <Ionicons name="cart" size={20} color="#ffffff" style={styles.purchaseButtonIcon} />
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f3f4f6',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  technicalItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  technicalLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  technicalValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  usageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  usageLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  usageValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  purchaseButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  purchaseButtonDisabled: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PhotoDetailScreen;
