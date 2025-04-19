// src/components/FavoritesTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { photoService } from '@/api/supabase';


interface FavoritesTabProps {
  navigation: any;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ navigation }) => {
  const { userProfile, removeFavorite } = useAuth();
  const [favoritePhotos, setFavoritePhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState({}); // Track loading state per photo

  // Load favorite photos
  useEffect(() => {
    const loadFavorites = async () => {
      if (!userProfile?.favorites || userProfile.favorites.length === 0) {
        setFavoritePhotos([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Initialize loading state for each photo
        const initialLoadingState = {};
        userProfile.favorites.forEach(id => {
          initialLoadingState[id] = true;
        });
        setLoadingPhotos(initialLoadingState);

        // Fetch photos one by one to show progress
        const photos = [];
        for (const photoId of userProfile.favorites) {
          try {
            const { data: photo, error } = await photoService.getPhotoById(photoId);
            if (error) throw error;

            if (photo) photos.push(photo);
          } catch (err) {
            console.error(`Error loading photo ${photoId}:`, err);
          } finally {
            // Update loading state for this photo
            setLoadingPhotos(prev => ({
              ...prev,
              [photoId]: false
            }));
          }
        }

        setFavoritePhotos(photos);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorite photos');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [userProfile?.favorites]);

  // Remove from favorites
  const handleRemoveFavorite = async (photoId) => {
    try {
      await removeFavorite(photoId);
      // Photo will be removed from the list when userProfile.favorites changes
      Alert.alert('Success', 'Photo removed from favorites');
    } catch (err) {
      console.error('Error removing favorite:', err);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  // View photo details
  const handleViewPhoto = (photoId) => {
    navigation.navigate('PhotoDetailScreen', { id: photoId });
  };

  if (isLoading && !favoritePhotos.length) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  if (error && !favoritePhotos.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userProfile?.favorites?.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="heart-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyStateTitle}>No favorites yet</Text>
        <Text style={styles.emptyStateText}>
          Photos you mark as favorites will appear here
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Gallery')}
        >
          <Text style={styles.browseButtonText}>Browse Photos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={favoritePhotos}
      keyExtractor={(item) => item.image_no}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        isLoading && favoritePhotos.length > 0 ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text style={styles.loadingMoreText}>Loading more favorites...</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.favoriteItem}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => handleViewPhoto(item.image_no)}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View style={styles.details}>
            <TouchableOpacity onPress={() => handleViewPhoto(item.image_no)}>
              <Text style={styles.title} numberOfLines={2}>
                {item.description || 'Untitled Photo'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.photographer} numberOfLines={1}>
              {item.photographer || 'Unknown photographer'}
            </Text>

            {item.location && (
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewPhoto(item.image_no)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.image_no)}
              >
                <Ionicons name="heart-dislike-outline" size={16} color="#ef4444" />
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        userProfile?.favorites?.length > 0 && favoritePhotos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading your favorites...</Text>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingMore: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  photographer: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  viewButtonText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default FavoritesTab;