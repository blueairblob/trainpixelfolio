
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, StatusBar, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPhotoById } from '../services/photoService';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [photo, setPhoto] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch photo details
  useEffect(() => {
    const loadPhoto = async () => {
      setIsLoading(true);
      try {
        const photoData = await getPhotoById(id);
        setPhoto(photoData);
      } catch (error) {
        console.error('Error loading photo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhoto();
  }, [id]);

  // Handle quantity changes
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    // In a real app, we would call addToCart from CartContext
    console.log(`Adding to cart: ${id}, quantity: ${quantity}`);
    navigation.navigate('Cart');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading photo details...</Text>
      </SafeAreaView>
    );
  }

  if (!photo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Photo not found</Text>
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
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {!imageLoaded && (
              <View style={[styles.imagePlaceholder, styles.absoluteFill]}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            <Image 
              source={{ uri: photo.imageUrl }}
              style={styles.image}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            {/* Photo Information Overlay */}
            <View style={styles.photoInfoOverlay}>
              <View style={styles.tagContainer}>
                {photo.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Content Section */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{photo.title}</Text>
            
            <View style={styles.photographerRow}>
              <View style={styles.photographerInfo}>
                <Ionicons name="person" size={16} color="#6b7280" />
                <Text style={styles.photographerText}>{photo.photographer}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text style={styles.locationText}>{photo.location}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{photo.description}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.licenseSection}>
              <Text style={styles.sectionTitle}>License Information</Text>
              <View style={styles.licenseInfo}>
                <View style={styles.licenseItem}>
                  <Text style={styles.licenseLabel}>Standard License</Text>
                  <Text style={styles.licenseValue}>Personal and commercial use</Text>
                </View>
                <View style={styles.licenseItem}>
                  <Text style={styles.licenseLabel}>Resolution</Text>
                  <Text style={styles.licenseValue}>High (5000x3333 px)</Text>
                </View>
                <View style={styles.licenseItem}>
                  <Text style={styles.licenseLabel}>Format</Text>
                  <Text style={styles.licenseValue}>JPEG, PNG</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Pricing and Add to Cart */}
            <View style={styles.pricingSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.price}>${photo.price.toFixed(2)}</Text>
              </View>
              
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton} 
                    onPress={decreaseQuantity}
                  >
                    <Ionicons name="remove" size={20} color="#4b5563" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton} 
                    onPress={increaseQuantity}
                  >
                    <Ionicons name="add" size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Total and Add to Cart Button */}
            <View style={styles.totalSection}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${(photo.price * quantity).toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Ionicons name="cart" size={20} color="white" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    backgroundColor: '#d1d5db',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  photographerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photographerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photographerText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  licenseSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  licenseInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  licenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  licenseLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  licenseValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  pricingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  quantityContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addToCartButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PhotoDetailScreen;
