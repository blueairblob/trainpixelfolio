// src/components/admin/AdminFavoritesSettings.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { photoService } from '@/api/supabase';
import { slideshowService } from '@/api/supabase';

const AdminFavoritesSettings: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  
  // State variables
  const [adminFavorites, setAdminFavorites] = useState<string[]>([]);
  const [adminFavoritePhotos, setAdminFavoritePhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load admin favorite settings
  useEffect(() => {
    loadAdminFavorites();
  }, []);
  
  // Load admin favorites using the slideshow service
  const loadAdminFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get admin favorites from the slideshow service
      const { data: storedFavorites, error: favoritesError } = await slideshowService.getAdminFavorites();
      
      if (favoritesError) {
        throw favoritesError;
      }
      
      let favorites: string[] = [];
      
      if (storedFavorites && storedFavorites.length > 0) {
        // Use stored favorites
        favorites = storedFavorites;
      } else if (userProfile?.favorites && userProfile.favorites.length > 0) {
        // If no stored admin favorites but the admin has personal favorites, use those
        favorites = userProfile.favorites.slice(0, 5); // Limit to 5
        
        // Save these as the initial admin favorites
        await slideshowService.saveAdminFavorites(favorites);
      }
      
      setAdminFavorites(favorites);
      
      // Now load the actual photos for these favorites
      await loadAdminFavoritePhotos(favorites);
    } catch (err) {
      console.error('Error loading admin favorites:', err);
      setError('Failed to load admin favorites');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load the full photo objects for admin favorites
  const loadAdminFavoritePhotos = async (favoriteIds: string[]) => {
    if (!favoriteIds.length) {
      setAdminFavoritePhotos([]);
      return;
    }
    
    try {
      const photos = [];
      
      for (const id of favoriteIds) {
        try {
          const { data: photo } = await photoService.getPhotoById(id);
          if (photo) {
            photos.push(photo);
          }
        } catch (err) {
          console.error(`Error loading admin favorite photo ${id}:`, err);
          // Continue with other photos even if one fails
        }
      }
      
      setAdminFavoritePhotos(photos);
    } catch (err) {
      console.error('Error loading admin favorite photos:', err);
      setError('Failed to load admin favorite photos');
    }
  };
  
  // Save admin favorites using the slideshow service
  const saveAdminFavorites = async () => {
    try {
      setIsSaving(true);
      
      const { error: saveError } = await slideshowService.saveAdminFavorites(adminFavorites);
      
      if (saveError) {
        throw saveError;
      }
      
      Alert.alert('Success', 'Admin favorites saved successfully');
    } catch (err) {
      console.error('Error saving admin favorites:', err);
      Alert.alert('Error', 'Failed to save admin favorites');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle photo search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      
      const { data: results, error } = await photoService.searchPhotos(
        searchQuery,
        { page: 1, limit: 20 }
      );
      
      if (error) throw error;
      
      setSearchResults(results || []);
    } catch (err) {
      console.error('Error searching photos:', err);
      Alert.alert('Error', 'Failed to search photos');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add a photo to admin favorites
  const addToAdminFavorites = async (photo: any) => {
    // Check if already in favorites
    if (adminFavorites.includes(photo.image_no)) {
      Alert.alert('Info', 'This photo is already in admin favorites');
      return;
    }
    
    // Add to admin favorites
    const updatedFavorites = [...adminFavorites, photo.image_no];
    setAdminFavorites(updatedFavorites);
    
    // Add to the displayed photos list
    setAdminFavoritePhotos(prev => [...prev, photo]);
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Remove a photo from admin favorites
  const removeFromAdminFavorites = (photoId: string) => {
    // Filter out the photo ID from favorites
    const updatedFavorites = adminFavorites.filter(id => id !== photoId);
    setAdminFavorites(updatedFavorites);
    
    // Update displayed photos
    setAdminFavoritePhotos(prev => prev.filter(photo => photo.image_no !== photoId));
  };
  
  // Reorder admin favorites (move up)
  const moveUp = (index: number) => {
    if (index <= 0) return; // Already at the top
    
    // Reorder the IDs array
    const updatedFavorites = [...adminFavorites];
    const temp = updatedFavorites[index];
    updatedFavorites[index] = updatedFavorites[index - 1];
    updatedFavorites[index - 1] = temp;
    setAdminFavorites(updatedFavorites);
    
    // Also reorder the photos array to match
    const updatedPhotos = [...adminFavoritePhotos];
    const tempPhoto = updatedPhotos[index];
    updatedPhotos[index] = updatedPhotos[index - 1];
    updatedPhotos[index - 1] = tempPhoto;
    setAdminFavoritePhotos(updatedPhotos);
  };
  
  // Reorder admin favorites (move down)
  const moveDown = (index: number) => {
    if (index >= adminFavorites.length - 1) return; // Already at the bottom
    
    // Reorder the IDs array
    const updatedFavorites = [...adminFavorites];
    const temp = updatedFavorites[index];
    updatedFavorites[index] = updatedFavorites[index + 1];
    updatedFavorites[index + 1] = temp;
    setAdminFavorites(updatedFavorites);
    
    // Also reorder the photos array to match
    const updatedPhotos = [...adminFavoritePhotos];
    const tempPhoto = updatedPhotos[index];
    updatedPhotos[index] = updatedPhotos[index + 1];
    updatedPhotos[index + 1] = tempPhoto;
    setAdminFavoritePhotos(updatedPhotos);
  };
  
  // Check if user is not an admin
  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>
          Only administrators can manage default favorites.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Default Slideshow Favorites</Text>
      <Text style={styles.description}>
        These photos will be shown in the homepage slideshow for users who haven't set their own favorites.
      </Text>
      
      {/* Search section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Add Photos to Default Favorites</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for photos to add..."
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="search" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              Search Results ({searchResults.length} photos)
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.image_no}
              horizontal
              showsHorizontalScrollIndicator={true}
              renderItem={({ item }) => (
                <View style={styles.searchResultItem}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.searchResultImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToAdminFavorites(item)}
                  >
                    <Ionicons name="add-circle" size={24} color="#4f46e5" />
                  </TouchableOpacity>
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {item.description || 'Untitled Photo'}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
      
      {/* Current admin favorites section */}
      <View style={styles.currentFavoritesSection}>
        <Text style={styles.sectionTitle}>Current Default Favorites</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading admin favorites...</Text>
          </View>
        ) : adminFavoritePhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No default favorites set</Text>
            <Text style={styles.emptySubtext}>
              Search for photos above to add them as defaults
            </Text>
          </View>
        ) : (
          <FlatList
            data={adminFavoritePhotos}
            keyExtractor={(item) => item.image_no}
            renderItem={({ item, index }) => (
              <View style={styles.favoriteItem}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.favoriteImage}
                  resizeMode="cover"
                />
                <View style={styles.favoriteInfo}>
                  <Text style={styles.favoriteTitle} numberOfLines={1}>
                    {item.description || 'Untitled Photo'}
                  </Text>
                  <Text style={styles.favoritePhotographer} numberOfLines={1}>
                    {item.photographer || 'Unknown photographer'}
                  </Text>
                </View>
                
                <View style={styles.favoriteActions}>
                  {/* Reorder buttons */}
                  <View style={styles.reorderButtons}>
                    <TouchableOpacity
                      style={[styles.reorderButton, index === 0 && styles.disabledButton]}
                      onPress={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={20} 
                        color={index === 0 ? "#9ca3af" : "#4b5563"} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reorderButton, 
                        index === adminFavoritePhotos.length - 1 && styles.disabledButton
                      ]}
                      onPress={() => moveDown(index)}
                      disabled={index === adminFavoritePhotos.length - 1}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={index === adminFavoritePhotos.length - 1 ? "#9ca3af" : "#4b5563"} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromAdminFavorites(item.image_no)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
      
      {/* Save button - Modified to always show, regardless of whether there are favorites */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveAdminFavorites}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {adminFavorites.length > 0 
              ? "Save Default Favorites" 
              : "Save Empty Favorites List"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsContainer: {
    marginTop: 12,
  },
  searchResultsTitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  searchResultItem: {
    width: 140,
    marginRight: 12,
    position: 'relative',
  },
  searchResultImage: {
    width: 140,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 12,
    color: '#4b5563',
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentFavoritesSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  favoritePhotographer: {
    fontSize: 12,
    color: '#6b7280',
  },
  favoriteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderButtons: {
    marginRight: 8,
  },
  reorderButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  unauthorizedContainer: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  unauthorizedText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminFavoritesSettings;