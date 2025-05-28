// src/components/admin/AdminSlideshowSettings.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { photoService } from '@/api/supabase';
import { slideshowService } from '@/api/supabase';
import SelectInput from '@/components/filters/SelectInput';

// Define category settings including which ones can use auto mode
const SLIDESHOW_CATEGORIES = [
  { id: 'favorites', name: 'Default Favourites', multipleAllowed: true, autoModeAllowed: false },
  { id: 'featured', name: 'Featured', multipleAllowed: false, autoModeAllowed: true },
  { id: 'new', name: 'New', multipleAllowed: false, autoModeAllowed: true },
  { id: 'popular', name: 'Popular', multipleAllowed: false, autoModeAllowed: true },
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
  const [error, setError] = useState<string | null>(null);
  
  // New state to hold the master favorites list
  const [masterFavoritesList, setMasterFavoritesList] = useState<any[]>([]);
  const [isMasterListLoading, setIsMasterListLoading] = useState(true);
  
  // Auto mode states - track which categories have auto mode enabled
  const [autoModeSettings, setAutoModeSettings] = useState<Record<string, boolean>>({
    featured: true,
    new: true,
    popular: true
  });
  
  // Get the current category config
  const currentCategory = SLIDESHOW_CATEGORIES.find(c => c.id === selectedCategory) || SLIDESHOW_CATEGORIES[0];
  const isMultipleAllowed = currentCategory.multipleAllowed;
  const isAutoModeAllowed = currentCategory.autoModeAllowed;
  const isAutoModeEnabled = autoModeSettings[selectedCategory] || false;
  
  // Load slideshow settings and master favorites list
  useEffect(() => {
    loadAutoModeSettings();
    loadMasterFavoritesList();
    loadCategoryPhotos();
  }, [selectedCategory]);
  
  // Load auto mode settings from AsyncStorage
  const loadAutoModeSettings = async () => {
    try {
      const settings: Record<string, boolean> = {};
      
      // Load auto mode settings for each category that supports it
      for (const category of SLIDESHOW_CATEGORIES) {
        if (category.autoModeAllowed) {
          const { data } = await slideshowService.getAutoModeSetting(category.id);
          settings[category.id] = data !== null ? data : true; // Default to true if not set
        }
      }
      
      setAutoModeSettings(settings);
    } catch (err) {
      console.error('Error loading auto mode settings:', err);
      // Default to true for all categories that support auto mode
      const defaultSettings: Record<string, boolean> = {};
      SLIDESHOW_CATEGORIES.forEach(category => {
        if (category.autoModeAllowed) {
          defaultSettings[category.id] = true;
        }
      });
      setAutoModeSettings(defaultSettings);
    }
  };
  
  // Load the master favorites list
  const loadMasterFavoritesList = async () => {
    try {
      setIsMasterListLoading(true);
      
      // Use the current user's favorites list regardless of admin status
      let favoriteIds: string[] = [];
      
      if (userProfile?.favorites && userProfile.favorites.length > 0) {
        // Use the current user's personal favorites
        favoriteIds = userProfile.favorites;
        console.log(`Loading ${favoriteIds.length} user favorites for slideshow management`);
      } else {
        // If the user has no favorites, try to fall back to admin defaults
        const { data: adminFavorites, error: favoritesError } = await slideshowService.getAdminFavorites();
        
        if (!favoritesError && adminFavorites && adminFavorites.length > 0) {
          favoriteIds = adminFavorites;
          console.log(`No user favorites found, using ${favoriteIds.length} admin defaults`);
        } else {
          console.log('No favorites found for user or admin defaults');
        }
      }
      
      // Now load the actual photos for these favorites
      const photos = [];
      
      for (const id of favoriteIds) {
        try {
          const { data: photo } = await photoService.getPhotoById(id);
          if (photo) {
            photos.push(photo);
          }
        } catch (err) {
          console.error(`Error loading favorite photo ${id}:`, err);
          // Continue with other photos even if one fails
        }
      }
      
      setMasterFavoritesList(photos);
      console.log(`Successfully loaded ${photos.length} photos for master favorites list`);
    } catch (err) {
      console.error('Error loading master favorites list:', err);
      setError('Failed to load favorites list');
    } finally {
      setIsMasterListLoading(false);
    }
  };
  
  // Save auto mode setting for the current category
  const saveAutoModeSetting = async (category: string, enabled: boolean) => {
    try {
      await slideshowService.saveAutoModeSetting(category, enabled);
      
      // Update local state
      setAutoModeSettings(prev => ({
        ...prev,
        [category]: enabled
      }));
      
      return true;
    } catch (err) {
      console.error(`Error saving auto mode setting for ${category}:`, err);
      return false;
    }
  };
  
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
      
      // If auto mode is allowed for this category, save the auto mode setting first
      if (isAutoModeAllowed) {
        const success = await saveAutoModeSetting(selectedCategory, isAutoModeEnabled);
        if (!success) {
          throw new Error(`Failed to save auto mode setting for ${currentCategory.name}`);
        }
      }
      
      // If auto mode is enabled, we don't need to save manual selections
      // But we'll clear any existing selections to avoid confusion
      if (isAutoModeAllowed && isAutoModeEnabled) {
        // Clear any existing selections for this category
        await slideshowService.saveCategoryPhotos(selectedCategory, []);
        Alert.alert('Success', `${currentCategory.name} set to automatic mode`);
        setIsSaving(false);
        return;
      }
      
      // Otherwise, save the selected photos
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
  
  // Handle auto mode toggle
  const handleAutoModeToggle = (enabled: boolean) => {
    // Update local state immediately for responsive UI
    setAutoModeSettings(prev => ({
      ...prev,
      [selectedCategory]: enabled
    }));
  };
  
  // Add a photo from the master favorites list to the current category
  const addToCategory = async (photo: any) => {
    // If auto mode is enabled, warn the user
    if (isAutoModeAllowed && isAutoModeEnabled) {
      Alert.alert(
        'Auto Mode Enabled',
        `Auto mode is currently enabled for ${currentCategory.name}. Disable auto mode to manually select photos.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable Auto Mode', 
            onPress: () => {
              // Disable auto mode and add the photo
              handleAutoModeToggle(false);
              addToCategoryInternal(photo);
            } 
          }
        ]
      );
      return;
    }
    
    addToCategoryInternal(photo);
  };
  
  // Internal function to add a photo to the category
  const addToCategoryInternal = (photo: any) => {
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
  };
  
  // Remove a photo from the current category
  const removeFromCategory = (photoId: string) => {
    // If auto mode is enabled, warn the user
    if (isAutoModeAllowed && isAutoModeEnabled) {
      Alert.alert(
        'Auto Mode Enabled',
        `Auto mode is currently enabled for ${currentCategory.name}. Disable auto mode to manually remove photos.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable Auto Mode', 
            onPress: () => {
              // Disable auto mode and remove the photo
              handleAutoModeToggle(false);
              removeFromCategoryInternal(photoId);
            } 
          }
        ]
      );
      return;
    }
    
    removeFromCategoryInternal(photoId);
  };
  
  // Internal function to remove a photo from the category
  const removeFromCategoryInternal = (photoId: string) => {
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
    // Don't allow reordering when auto mode is enabled
    if (isAutoModeAllowed && isAutoModeEnabled) {
      Alert.alert(
        'Auto Mode Enabled',
        `Auto mode is currently enabled for ${currentCategory.name}. Disable auto mode to reorder photos.`
      );
      return;
    }
    
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
    // Don't allow reordering when auto mode is enabled
    if (isAutoModeAllowed && isAutoModeEnabled) {
      Alert.alert(
        'Auto Mode Enabled',
        `Auto mode is currently enabled for ${currentCategory.name}. Disable auto mode to reorder photos.`
      );
      return;
    }
    
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
  

  // Render the master favorites list section
  const renderMasterFavoritesList = () => {
    if (isMasterListLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading favorites list...</Text>
        </View>
      );
    }
    
    if (masterFavoritesList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No favorites available</Text>
          <Text style={styles.emptySubtext}>
            Add photos to your favorites list to use them in slideshows
          </Text>
          <TouchableOpacity
            style={styles.manageFavoritesButton}
            onPress={() => Alert.alert('Info', 'Go to the Gallery and tap the heart icon on photos to add them to your favorites')}
          >
            <Text style={styles.manageFavoritesText}>How to Add Favorites</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    console.log(`Rendering ${masterFavoritesList.length} favorites`);
    
    // Fixed horizontal ScrollView structure
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        style={styles.horizontalScrollView}
      >
        {masterFavoritesList.map(item => (
          <View key={item.image_no} style={styles.searchResultItem}>
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
        ))}
      </ScrollView>
    );
  };

  // Render the current photos section
  const renderCurrentPhotos = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      );
    }
    
    if (displayedPhotos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No photos set for {currentCategory.name}</Text>
          <Text style={styles.emptySubtext}>
            Add photos from the favorites list above
          </Text>
        </View>
      );
    }
    
    // If we have a small number of items, we don't need scrolling
    if (displayedPhotos.length <= 4) {
      return (
        <View>
          {displayedPhotos.map((item, index) => renderPhotoItem(item, index))}
        </View>
      );
    }
    
    // For more items, use a ScrollView to enable vertical scrolling within this section
    return (
      <ScrollView 
        style={styles.photoListScrollView}
        contentContainerStyle={styles.photoListContent}
        nestedScrollEnabled={true}
      >
        {displayedPhotos.map((item, index) => renderPhotoItem(item, index))}
      </ScrollView>
    );
  };

// Extract the photo item rendering to a separate function for reuse
const renderPhotoItem = (item, index) => (
  <View key={item.image_no} style={styles.photoItem}>
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
);
  
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
      
      {/* Auto mode toggle - only show for categories that support it */}
      {isAutoModeAllowed && (
        <View style={styles.autoModeContainer}>
          <View style={styles.autoModeToggleRow}>
            <Text style={styles.autoModeLabel}>Auto Mode</Text>
            <Switch
              value={isAutoModeEnabled}
              onValueChange={handleAutoModeToggle}
              trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
              thumbColor={isAutoModeEnabled ? '#4f46e5' : '#9ca3af'}
            />
          </View>
          <Text style={styles.autoModeDescription}>
            {isAutoModeEnabled 
              ? `${currentCategory.name} will be automatically selected from the database.`
              : `Manually select photos from the favorites list to use for ${currentCategory.name}.`}
          </Text>
        </View>
      )}
      
      {/* If auto mode is enabled, show a message */}
      {isAutoModeAllowed && isAutoModeEnabled ? (
        <View style={styles.autoModeActiveContainer}>
          <Ionicons name="flash" size={32} color="#4f46e5" />
          <Text style={styles.autoModeActiveTitle}>Auto Mode Enabled</Text>
          <Text style={styles.autoModeActiveText}>
            {currentCategory.name} will be automatically selected based on the most{' '}
            {selectedCategory === 'new' ? 'recent' : 
             selectedCategory === 'popular' ? 'popular' : 'relevant'} photos.
          </Text>
          <Text style={styles.autoModeActiveHint}>
            Disable auto mode to manually select photos.
          </Text>
        </View>
      ) : (
        <View>
          {/* Master Favorites List - only show when auto mode is disabled */}
          <View style={styles.favoritesListSection}>
            <Text style={styles.sectionTitle}>
              Add Photos from Your Favorites ({masterFavoritesList.length} available) to {currentCategory.name}
            </Text>
            {renderMasterFavoritesList()}
          </View>
          
          {/* Current photos section - only show when auto mode is disabled */}
          <View style={styles.currentPhotosSection}>
            <Text style={styles.sectionTitle}>Current {currentCategory.name}</Text>
            {renderCurrentPhotos()}
          </View>
        </View>
      )}
      
      {/* Save button - always show */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveCategoryPhotos}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isAutoModeAllowed && isAutoModeEnabled
              ? `Save ${currentCategory.name} Auto Mode`
              : `Save ${currentCategory.name}`}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  // Auto mode styles
  autoModeContainer: {
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  autoModeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  autoModeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  autoModeActiveContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 24,
  },
  autoModeActiveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4f46e5',
    marginTop: 8,
    marginBottom: 8,
  },
  autoModeActiveText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  autoModeActiveHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  // Master favorites list section
  favoritesListSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  // Updated horizontal scroll styles
  horizontalScrollView: {
    height: 160,
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
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
  // Current photos section
  currentPhotosSection: {
    marginBottom: 24,
    maxHeight: 300,
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
    marginBottom: 12,
  },
  manageFavoritesButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  manageFavoritesText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
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
    marginTop: 16,
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
  photoListScrollView: {
    maxHeight: 300,
  },
  photoListContent: {
    paddingVertical: 8,
  },
});

export default AdminSlideshowSettings;