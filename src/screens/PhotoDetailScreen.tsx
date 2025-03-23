// PhotoDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, Share, Dimensions, Animated, StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { allPhotos } from '../services/photoService';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  // Find the photo based on id
  const photo = allPhotos.find(p => p.id === id) || {
    id: 'not-found',
    title: 'Photo Not Found',
    description: 'The requested photo could not be found.',
    price: 0,
    imageUrl: 'https://via.placeholder.com/400x300?text=Not+Found',
    photographer: 'Unknown',
    location: 'Unknown',
    tags: ['Error'],
  };
  
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Reset animation when photo changes
    setImageLoaded(false);
    fadeAnim.setValue(0);
  }, [id]);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing train photo: ${photo.title} by ${photo.photographer}`,
        url: photo.imageUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleAddToCart = () => {
    // In a real app, we'd call the cart context's addToCart method
    navigation.navigate('Cart');
  };
  
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo Details</Text>
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {/* Photo */}
        <View style={styles.imageContainer}>
          {!imageLoaded && (
            <View style={[styles.imagePlaceholder, { width: screenWidth, height: screenWidth * 0.75 }]}>
              <Ionicons name="image-outline" size={48} color="#d1d5db" />
            </View>
          )}
          <Animated.Image
            source={{ uri: photo.imageUrl }}
            style={[
              styles.photoImage, 
              { width: screenWidth, height: screenWidth * 0.75, opacity: fadeAnim }
            ]}
            resizeMode="cover"
            onLoad={handleImageLoad}
          />
        </View>
        
        {/* Photo Info */}
        <View style={styles.photoInfo}>
          <Text style={styles.photoTitle}>{photo.title}</Text>
          
          <View style={styles.photographerRow}>
            <View style={styles.photographerInfo}>
              <Ionicons name="person-outline" size={16} color="#4f46e5" style={styles.infoIcon} />
              <Text style={styles.photographerName}>{photo.photographer}</Text>
            </View>
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color="#4f46e5" style={styles.infoIcon} />
              <Text style={styles.location}>{photo.location}</Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {photo.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Ionicons name="pricetag-outline" size={12} color="#4f46e5" style={styles.tagIcon} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.separator} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{photo.description}</Text>
          
          <View style={styles.separator} />
          
          <Text style={styles.sectionTitle}>License Information</Text>
          <View style={styles.licenseInfo}>
            <View style={styles.licenseItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              <Text style={styles.licenseText}>Commercial use permitted</Text>
            </View>
            <View style={styles.licenseItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              <Text style={styles.licenseText}>Digital and print media</Text>
            </View>
            <View style={styles.licenseItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
              <Text style={styles.licenseText}>Lifetime license</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          {/* Purchase Section */}
          <View style={styles.purchaseSection}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.price}>${photo.price.toFixed(2)}</Text>
            
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? "#9ca3af" : "#4b5563"} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Ionicons name="add" size={18} color="#4b5563" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                ${(photo.price * quantity).toFixed(2)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart-outline" size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f9fafb',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
  },
  photoInfo: {
    padding: 16,
  },
  photoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  photographerRow: {
    marginBottom: 16,
  },
  photographerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  photographerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4b5563',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4f46e5',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
  },
  licenseInfo: {
    marginTop: 8,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  licenseText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  purchaseSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  addToCartButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PhotoDetailScreen;
