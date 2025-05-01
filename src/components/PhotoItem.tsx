// src/components/PhotoItem.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';

interface Photo {
  id: string;
  title: string;
  photographer: string;
  price: number;
  imageUrl: string;
  thumbnailUrl?: string; // Make thumbnail optional
  location: string;
  description: string;
}

interface PhotoItemProps {
  photo: Photo;
  viewMode: 'grid' | 'compact' | 'single';
  onPress: (id: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, viewMode, onPress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { addFavorite, removeFavorite, isFavorite } = useAuth();
  const [isFavoriteState, setIsFavoriteState] = useState(false);

  // Check if photo is in favorites
  useEffect(() => {
    // Make sure we're using the correct ID format (image_no)
    const favoriteId = photo.image_no || photo.id;
    setIsFavoriteState(isFavorite(favoriteId));
  }, [photo, isFavorite]);

  // Memoize the onPress handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(photo.id);
  }, [photo.id, onPress]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  }, []);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (e) => {
    e.stopPropagation(); // Prevent triggering the parent onPress
    
    try {
      // Make sure we're using the correct ID format (image_no)
      const favoriteId = photo.image_no || photo.id;
      
      console.log(`Toggle favorite for photo ${favoriteId}`);
      
      if (isFavoriteState) {
        await removeFavorite(favoriteId);
        setIsFavoriteState(false);
      } else {
        await addFavorite(favoriteId);
        setIsFavoriteState(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Could not update favorites');
    }
  }, [isFavoriteState, photo.image_no, photo.id, addFavorite, removeFavorite]);

  // Generate a placeholder blurhash-like color based on the photo id
  const placeholderColor = `#${(parseInt(photo.id.replace(/\D/g, ''), 10) % 0xffffff).toString(16).padStart(6, '0')}`;

  const renderImage = (imageStyle: any) => (
    <View style={{ position: 'relative' }}>
      {isLoading && (
        <ActivityIndicator
          style={styles.loader}
          size="small"
          color="#4f46e5"
        />
      )}
      {hasError && !isLoading && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
      <Image
        source={{ uri: photo.imageUrl || 'https://via.placeholder.com/150' }}
        style={[imageStyle, hasError && styles.errorImage]}
        contentFit="cover"
        transition={300}
        placeholder={photo.thumbnailUrl}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={`${photo.id}-${retryCount}`} // Helps with image refresh on retry
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.log(`Image failed to load: ${photo.imageUrl}`);
          setIsLoading(false);
          setHasError(true);
        }}
      />
      
      {/* Favorite button overlay */}
      <TouchableOpacity 
        style={styles.favoriteOverlay}
        onPress={handleFavoriteToggle}
      >
        <Ionicons 
          name={isFavoriteState ? "heart" : "heart-outline"} 
          size={viewMode === 'grid' ? 18 : 22} 
          color={isFavoriteState ? "#ef4444" : "#ffffff"} 
        />
      </TouchableOpacity>
    </View>
  );

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={handlePress}
        activeOpacity={0.7} // Better feedback on touch
      >
        {renderImage(styles.gridImage)}
        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemTitle} numberOfLines={1}>{photo.title}</Text>
          <Text style={styles.compactPhotographer}>{photo.photographer}</Text>
          {/* <Text style={styles.gridItemPrice}>£{photo.price.toFixed(2)}</Text> */}
        </View>
      </TouchableOpacity>
    );
  } else if (viewMode === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {renderImage(styles.compactImage)}
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{photo.title}</Text>
          <Text style={styles.compactPhotographer}>{photo.photographer}</Text>
          <View style={styles.compactFooter}>
            {/* <Text style={styles.compactPrice}>£{photo.price.toFixed(2)}</Text> */}
            <View style={styles.compactButtonGroup}>
              <TouchableOpacity 
                style={styles.compactButton} 
                onPress={handleFavoriteToggle}
              >
                <Ionicons 
                  name={isFavoriteState ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavoriteState ? "#ef4444" : "#4b5563"} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.compactButton} activeOpacity={0.6}>
                <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  } else {
    return (
      <View style={styles.singleItem}>
        {renderImage(styles.singleImage)}
        <View style={styles.singleInfo}>
          <Text style={styles.singleTitle}>{photo.title}</Text>
          <Text style={styles.singlePhotographer}>By {photo.photographer}</Text>
          {photo.location && <Text style={styles.singleLocation}>{photo.location}</Text>}
          {photo.description && (
            <Text style={styles.singleDescription} numberOfLines={3}>{photo.description}</Text>
          )}
          <View style={styles.singleFooter}>
            <Text style={styles.singlePrice}>£{photo.price.toFixed(2)}</Text>
            <View style={styles.singleButtons}>
              <TouchableOpacity
                style={[styles.favoriteButton, isFavoriteState && styles.favoriteButtonActive]}
                onPress={handleFavoriteToggle}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isFavoriteState ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isFavoriteState ? "#ef4444" : "#4b5563"} 
                />
                <Text style={[
                  styles.favoriteButtonText,
                  isFavoriteState && styles.favoriteButtonTextActive
                ]}>
                  {isFavoriteState ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={styles.detailButtonText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                activeOpacity={0.7}
              >
                <Ionicons name="cart-outline" size={16} color="#ffffff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridItemInfo: {
    padding: 8,
  },
  gridItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  gridItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  compactItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  compactPhotographer: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  compactButtonGroup: {
    flexDirection: 'row',
  },
  compactButton: {
    padding: 4,
    marginLeft: 8,
  },
  singleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  singleInfo: {
    padding: 16,
  },
  singleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  singlePhotographer: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  singleLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  singleDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  singleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singlePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  singleButtons: {
    flexDirection: 'row',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#fef2f2',
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButtonTextActive: {
    color: '#ef4444',
  },
  detailButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#4f46e5',
  },
  addButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Styles for loading and error states
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 10,
  },
  retryButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -15 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  retryText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  errorImage: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  // Favorite overlay for grid and compact views
  favoriteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default PhotoItem;