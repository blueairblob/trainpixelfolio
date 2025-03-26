import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Photo {
  id: string;
  title: string;
  photographer: string;
  price: number;
  imageUrl: string;
  location: string;
  description: string;
}

interface PhotoItemProps {
  photo: Photo;
  viewMode: 'grid' | 'compact' | 'single';
  onPress: (id: string) => void;
}

const PhotoItem = ({ photo, viewMode, onPress }: PhotoItemProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

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
        source={{ uri: photo.imageUrl || 'https://via.placeholder.com/150', cache: 'reload' }}
        style={[imageStyle, hasError && styles.errorImage]}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(error) => {
          console.log(`Image failed to load: ${photo.imageUrl}`, error.nativeEvent.error);
          setIsLoading(false);
          setHasError(true);
        }}
        key={retryCount} // Forces re-render on retry
      />
    </View>
  );

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => onPress(photo.id)}
      >
        {renderImage(styles.gridImage)}
        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemTitle} numberOfLines={1}>{photo.title}</Text>
          <Text style={styles.gridItemPrice}>${photo.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (viewMode === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactItem}
        onPress={() => onPress(photo.id)}
      >
        {renderImage(styles.compactImage)}
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{photo.title}</Text>
          <Text style={styles.compactPhotographer}>{photo.photographer}</Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactPrice}>${photo.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.compactButton}>
              <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>
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
          <Text style={styles.singleLocation}>{photo.location}</Text>
          <Text style={styles.singleDescription} numberOfLines={3}>{photo.description}</Text>
          <View style={styles.singleFooter}>
            <Text style={styles.singlePrice}>${photo.price.toFixed(2)}</Text>
            <View style={styles.singleButtons}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => onPress(photo.id)}
              >
                <Text style={styles.detailButtonText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
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
  // Existing styles...
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
  compactButton: {
    padding: 4,
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
  // New styles for loading and error states
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
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
});

export default PhotoItem;