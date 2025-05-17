// src/components/admin/AdminSlideshowSettings.tsx
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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { photoService } from '@/api/supabase';
import { slideshowService } from '@/api/supabase';
import SelectInput from '@/components/filters/SelectInput';

const SLIDESHOW_CATEGORIES = [
  { id: 'favorites', name: 'Default Favourites', multipleAllowed: true },
  { id: 'featured', name: 'Featured', multipleAllowed: false },
  { id: 'new', name: 'New', multipleAllowed: false },
  { id: 'popular', name: 'Popular', multipleAllowed: false },
];

const AdminSlideshowSettings: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  
  // State variables
  const [selectedCategory, setSelectedCategory] = useState('favorites');
  const [categoryPhotos, setCategoryPhotos] = useState<Record<string, string[]>>({
    favorites: [],
    featured: [],
    new: [],
    popular: []
  });
  const [displayedPhotos, setDisplayedPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current category config
  const currentCategory = SLIDESHOW_CATEGORIES.find(c => c.id === selectedCategory) || SLIDESHOW_CATEGORIES[0];
  const isMultipleAllowed = currentCategory.multipleAllowed;
  
  // Load slideshow settings
  useEffect(() => {
    loadCategoryPhotos();
  }, [selectedCategory]);
  
  // Load slideshow settings for the selected category
  const loadCategoryPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get photos for the selected category
      const { data: storedPhotos, error: photosError } = await slideshowService.getCategoryPhotos(selectedCategory);
      
      if (photosError) {
        throw photosError;
      }
      
      let photos: string[] = [];
      
      if (storedPhotos && storedPhotos.length > 0) {
        // Use stored photos
        photos = storedPhotos;
      } else if (selectedCategory === 'favorites' && userProfile?.favorites && userProfile.favorites.length > 0) {
        // If no stored favorites but the admin has personal favorites, use those for the favorites category
        photos = userProfile.favorites.slice(0, 5); // Limit to 5
        
        // Save these as the initial admin favorites
        await slideshowService.saveCategoryPhotos(selectedCategory, photos);
      }
      
      // Update the category photos
      setCategoryPhotos(prev => ({
        ...prev,
        [selectedCategory]: photos
      }));
      
      // Now load the actual photos for these IDs
      await loadPhotoObjects(photos);
    } catch (err) {
      console.error(`Error loading photos for ${selectedCategory}:`, err);
      setError(`Failed to load ${currentCategory.name}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load the full photo objects for the selected category
  const loadPhotoObjects = async (photoIds: string[]) => {
    if (!photoIds.length) {
      setDisplayedPhotos([]);
      return;
    }
    
    try {
      const photos = [];
      
      for (const id of photoIds) {
        try {
          const { data: photo } = await photoService.getPhotoById(id);
          if (photo) {
            photos.push(photo);
          }
        } catch (err) {
          console.error(`Error loading photo ${id}:`, err);
          // Continue with other photos even if one fails
        }
      }
      
      setDisplayedPhotos(photos);
    } catch (err) {
      console.error(`Error loading photos for ${selectedCategory}:`, err);
      setError(`Failed to load photos for ${currentCategory.name}`);
    }
  };
  
  // Save photos for the current category
  const saveCategoryPhotos = async () => {
    try {
      setIsSaving(true);
      
      const photos = categoryPhotos[selectedCategory];
      const { error: saveError } = await slideshowService.saveCategoryPhotos(selectedCategory, photos);
      
      if (saveError) {
        throw saveError;
      }
      
      Alert.alert('Success', `${currentCategory.name} saved successfully`);
    } catch (err) {
      console.error(`Error saving ${selectedCategory}:`, err);
      Alert.alert('Error', `Failed to save ${currentCategory.name}`);
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
  
  // Add a photo to the current category
  const addToCategory = async (photo: any) => {
    // Check if already in the category
    if (categoryPhotos[selectedCategory].includes(photo.image_no)) {
      Alert.alert('Info', `This photo is already in ${currentCategory.name}`);
      return;
    }
    
    // If not multiple allowed, replace the existing photo
    let updatedPhotos: string[];
    
    if (!isMultipleAllowed) {
      updatedPhotos = [photo.image_no];
    } else {
      updatedPhotos = [...categoryPhotos[selectedCategory], photo.image_no];
    }
    
    // Update the category photos
    setCategoryPhotos(prev => ({
      ...prev,
      [selectedCategory]: updatedPhotos
    }));
    
    // Update displayed photos - if not multiple allowed, replace the list
    if (!isMultipleAllowed) {
      setDisplayedPhotos([photo]);
    } else {
      setDisplayedPhotos(prev => [...prev, photo]);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Remove a photo from the current category
  const removeFromCategory = (photoId: string) => {
    // Filter out the photo ID from current category
    const updatedPhotos = categoryPhotos[selectedCategory].filter(id => id !== photoId);
    
    // Update the category photos
    setCategoryPhotos(prev => ({
      ...prev,
      [selectedCategory]: updatedPhotos
    }));
    
    // Update displayed photos
    setDisplayedPhotos(prev => prev.filter(photo => photo.image_no !== photoId));
  };
  
  // Reorder photos (move up) - only applicable for favorites
  const moveUp = (index: number) => {
    if (!isMultipleAllowed || index <= 0) return; // Already at the top or not allowed
    
    // Reorder the IDs array
    const photos = [...categoryPhotos[selectedCategory]];
    const temp = photos[index];
    photos[index] = photos[index - 1];
    photos[index - 1] = temp;
    
    setCategoryPhotos(prev => ({
      ...prev,
      [selectedCategory]: photos
    }));
    
    // Also reorder the photos array to match
    const updatedPhotos = [...displayedPhotos];
    const tempPhoto = updatedPhotos[index];
    updatedPhotos[index] = updatedPhotos[index - 1];
    updatedPhotos[index - 1] = tempPhoto;
    setDisplayedPhotos(updatedPhotos);
  };
  
  // Reorder photos (move down) - only applicable for favorites
  const moveDown = (index: number) => {
    if (!isMultipleAllowed || index >= displayedPhotos.length - 1) return; // Already at the bottom or not allowed
    
    // Reorder the IDs array
    const photos = [...categoryPhotos[selectedCategory]];
    const temp = photos[index];
    photos[index] = photos[index + 1];
    photos[index + 1] = temp;
    
    setCategoryPhotos(prev => ({
      ...prev,
      [selectedCategory]: photos
    }));
    
    // Also reorder the photos array to match
    const updatedPhotos = [...displayedPhotos];
    const tempPhoto = updatedPhotos[index];
    updatedPhotos[index] = updatedPhotos[index + 1];
    updatedPhotos[index + 1] = tempPhoto;
    setDisplayedPhotos(updatedPhotos);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Check if user is not an admin
  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>
          Only administrators can manage slideshow settings.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Slideshow Categories</Text>
      <Text style={styles.description}>
        Configure photos for different sections of the homepage slideshow.
      </Text>
      
      {/* Category selection */}
      <View style={styles.categorySelection}>
        <Text style={styles.label}>Select Category:</Text>
        <SelectInput
          label=""
          options={SLIDESHOW_CATEGORIES.map(cat => ({ id: cat.id, name: cat.name }))}
          selectedValue={selectedCategory}
          onValueChange={handleCategoryChange}
          placeholder="Select a category"
        />
        <Text style={styles.categoryHelp}>
          {isMultipleAllowed 
            ? 'This category supports multiple photos in order.'
            : 'This category supports only one photo.'}
        </Text>
      </View>
      
      {/* Search section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Add Photos to {currentCategory.name}</Text>
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
                    onPress={() => addToCategory(item)}
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
      
      {/* Current photos section */}
      <View style={styles.currentPhotosSection}>
        <Text style={styles.sectionTitle}>Current {currentCategory.name}</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading photos...</Text>
          </View>
        ) : displayedPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No photos set for {currentCategory.name}</Text>
            <Text style={styles.emptySubtext}>
              Search for photos above to add them
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedPhotos}
            keyExtractor={(item) => item.image_no}
            renderItem={({ item, index }) => (
              <View style={styles.photoItem}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoTitle} numberOfLines={1}>
                    {item.description || 'Untitled Photo'}
                  </Text>
                  <Text style={styles.photoPhotographer} numberOfLines={1}>
                    {item.photographer || 'Unknown photographer'}
                  </Text>
                </View>
                
                <View style={styles.photoActions}>
                  {/* Reorder buttons - only show for multiple allowed categories */}
                  {isMultipleAllowed && (
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
                          index === displayedPhotos.length - 1 && styles.disabledButton
                        ]}
                        onPress={() => moveDown(index)}
                        disabled={index === displayedPhotos.length - 1}
                      >
                        <Ionicons 
                          name="chevron-down" 
                          size={20} 
                          color={index === displayedPhotos.length - 1 ? "#9ca3af" : "#4b5563"} 
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCategory(item.image_no)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
      
      {/* Save button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveCategoryPhotos}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>
            Save {currentCategory.name}
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
  categorySelection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  categoryHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
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
  currentPhotosSection: {
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
  photoItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  photoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  photoPhotographer: {
    fontSize: 12,
    color: '#6b7280',
  },
  photoActions: {
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

export default AdminSlideshowSettings;