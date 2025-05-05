// src/screens/AdminScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Switch, Alert, ActivityIndicator,
  Modal, FlatList, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/context/AuthContext';
import { adminService, photoAdminService, photoService } from '@/api/supabase';
import SelectInput from '@/components/filters/SelectInput';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import { supabaseClient } from '@/api/supabase/client';
import { useFocusEffect } from '@react-navigation/native';
import PhotoManager from '@/components/admin/PhotoManager';
import AdminFavoritesSettings from '@/components/admin/AdminFavoritesSettings';

// Form types
interface PhotoMetadata {
  imageNo: string;
  description: string;
  category: string;
  photographer: string | null;
  location: string | null;
  organisation: string | null;
  gauge: string | null;
  dateTaken: string | null;
  collection: string | null;
  printAllowed: boolean;
  internetUse: boolean;
  publicationUse: boolean;
}

const AdminScreen = ({ navigation, route }) => {
  // Check if user is admin
  const { isAdmin, userProfile } = useAuth();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload/Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<any>(null);

  // Tabs state for different admin sections
  const tabs = [
    { id: 'dashboard', title: 'Dashboard', icon: 'grid-outline' },
    { id: 'upload', title: 'Upload', icon: 'cloud-upload-outline' },
    { id: 'favorites', title: 'Slideshow', icon: 'heart-outline' },
    { id: 'config', title: 'App Config', icon: 'settings-outline' },
    { id: 'users', title: 'Users', icon: 'people-outline' }
  ];
  
  // Dashboard states
  const [photoStats, setPhotoStats] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // Photo management states
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isPhotoDetailModalVisible, setIsPhotoDetailModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);
  
  // Upload states
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState<PhotoMetadata>({
    imageNo: '',
    description: '',
    category: '',
    photographer: null,
    location: null,
    organisation: null,
    gauge: null,
    dateTaken: null,
    collection: null,
    printAllowed: true,
    internetUse: true,
    publicationUse: false
  });
  
  // Reference options for dropdowns
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [photographerOptions, setPhotographerOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [organisationOptions, setOrganisationOptions] = useState<any[]>([]);
  const [gaugeOptions, setGaugeOptions] = useState<any[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<any[]>([]);
  
  // Config states
  const [appConfig, setAppConfig] = useState({
    appName: 'TrainPhoto',
    splashImageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a',
    primaryColor: '#4f46e5',
    secondaryColor: '#ef4444',
    featuredPhotoId: '',
    maxCacheSize: 200, // MB
    offlineSupport: true,
    showPrices: false
  });
  
  // User management states
  const [users, setUsers] = useState<any[]>([]);
  
  // Load initial data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'upload') {
      loadReferenceData();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'config') {
      loadAppConfig();
    }
  }, [activeTab]);

  // Handle navigation parameters for editing photos
  useFocusEffect(
    React.useCallback(() => {
      // Check for navigation parameters
      const params = route.params;
      if (params) {
        // If we have an initialTab parameter, set the active tab
        if (params.initialTab) {
          setActiveTab(params.initialTab);
        }
        
        // If we have a photoToEdit parameter, set up edit mode
        if (params.photoToEdit) {
          setIsLoading(true);
          
          // Get complete photo data or use what we already have
          if (params.photoToEdit.id) {
            // Set up edit mode with the provided photo
            setPhotoToEdit(params.photoToEdit);
            setIsEditMode(true);
          }
          
          setIsLoading(false);
        }
        
        // Clear the parameters to avoid processing them again
        navigation.setParams({ initialTab: undefined, photoToEdit: undefined });
      }
    }, [navigation])
  );
  
  // ==================== Dashboard Functions ====================
  
  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Load photo statistics
      const { data: stats, error: statsError } = await photoService.getPhotoStats();
      if (statsError) throw statsError;
      setPhotoStats(stats);
      
      // Get the actual total photo count instead of fixed number
      const { data: totalCount, error: countError } = await photoService.getTotalPhotoCount();
      if (countError) throw countError;
      
      // If stats doesn't have totalPhotos or it's wrong, update it
      if (!stats.totalPhotos || stats.totalPhotos !== totalCount) {
        setPhotoStats(prev => ({
          ...prev,
          totalPhotos: totalCount
        }));
      }
      
      // Load storage statistics
      const { data: storageSize, error: storageError } = await adminService.getStorageSize('picaloco', '');
      if (storageError) throw storageError;
      setStorageStats({
        totalSize: storageSize,
        formattedSize: formatBytes(storageSize)
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const handleReduceStorage = async () => {
    try {
      setIsLoading(true);
      
      // Confirm storage reduction
      Alert.alert(
        "Reduce Storage",
        "This will remove oldest files to reduce storage size. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reduce",
            style: "destructive",
            onPress: async () => {
              // Set target size to 1GB
              const targetSize = 1073741824; // 1GB in bytes
              
              const { data, error } = await adminService.reduceStorage('picaloco', '', targetSize);
              
              if (error) throw error;
              
              Alert.alert('Success', `Storage reduced to ${formatBytes(data || 0)}`);
              await loadStats();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error reducing storage:', error);
      Alert.alert('Error', 'Failed to reduce storage');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== Photo Management Functions ====================
  
  const loadPhotos = async (page: number = 1, query: string = '') => {
    try {
      setIsLoading(true);
      setCurrentPage(page);
      
      // Use the filter API to get photos with pagination
      const limit = 20;
      const { data: photos, error } = await photoService.filterPhotos(
        { searchQuery: query || searchQuery },
        { page, limit, useCache: false }
      );
      
      if (error) throw error;
      
      setPhotoList(photos || []);
      
      // Get total count for pagination
      const { data: count } = await adminService.countRecords('catalog', 
        query ? { search: query } : undefined
      );
      
      setTotalPhotos(count || 0);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchPhotos = () => {
    loadPhotos(1, searchQuery);
  };
  
  const handleViewPhotoDetails = (photo) => {
    setSelectedPhoto(photo);
    setIsPhotoDetailModalVisible(true);
  };
  
  const handleDeletePhoto = async (photo) => {
    try {
      // First confirm with the user
      setSelectedPhoto(photo);
      setIsDeleteConfirmVisible(true);
    } catch (error) {
      console.error('Error preparing photo deletion:', error);
      Alert.alert('Error', 'Could not prepare photo for deletion');
    }
  };
  
  const confirmDeletePhoto = async () => {
    try {
      setIsLoading(true);
      
      if (!selectedPhoto) {
        throw new Error('No photo selected for deletion');
      }
      
      // Use our refactored admin service to delete the photo
      const { error } = await photoAdminService.deletePhoto(selectedPhoto.id);
      
      if (error) throw error;
      
      setIsDeleteConfirmVisible(false);
      setIsPhotoDetailModalVisible(false);
      
      await loadPhotos(currentPage);
      
      Alert.alert('Success', 'Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== Upload Functions ====================
  
  const loadReferenceData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const { data: categories } = await photoService.getCategories();
      setCategoryOptions(categories?.map(cat => ({ id: cat, name: cat })) || []);
      
      // Fetch photographers
      const { data: photographers } = await adminService.photographers.getAll();
      setPhotographerOptions(photographers?.map(p => ({ id: p.id, name: p.name })) || []);
      
      // Fetch locations
      const { data: locations } = await adminService.locations.getAll();
      setLocationOptions(locations?.map(l => ({ id: l.id, name: l.name })) || []);
      
      // Fetch organisations
      const { data: organisations } = await adminService.organisations.getAll();
      setOrganisationOptions(organisations?.map(o => ({ id: o.id, name: o.name || 'Unnamed' })) || []);
      
      // Fetch gauges
      const { data: gauges } = await photoService.getPhotoStats();
      if (gauges?.gaugeStats) {
        setGaugeOptions(gauges.gaugeStats.map(g => ({ id: g.gauge, name: g.gauge })));
      }
      
      // Fetch collections
      const { data: collections } = await adminService.collections.getAll();
      setCollectionOptions(collections?.map(c => ({ id: c.id, name: c.name })) || []);
      
    } catch (error) {
      console.error('Error loading reference data:', error);
      Alert.alert('Error', 'Failed to load reference data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images');
        return;
      }
      
      // Launch the image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: true
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset);
        
        // If the image has EXIF data with a date, use it
        if (selectedAsset.exif && selectedAsset.exif.DateTimeOriginal) {
          const exifDate = new Date(selectedAsset.exif.DateTimeOriginal);
          if (!isNaN(exifDate.getTime())) {
            setMetadata(prev => ({
              ...prev,
              dateTaken: exifDate.toISOString().split('T')[0]
            }));
          }
        }
        
        // Try to extract an image number from the filename
        if (selectedAsset.fileName) {
          const match = selectedAsset.fileName.match(/(\d+)/);
          if (match && match[0]) {
            setMetadata(prev => ({
              ...prev,
              imageNo: `IMG${match[0].padStart(5, '0')}`
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image to upload');
      return;
    }
    
    if (!metadata.imageNo || !metadata.description || !metadata.category) {
      Alert.alert('Error', 'Please fill in all required fields: Image No, Description, and Category');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // First, read the image file
      const uri = selectedImage.uri;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      // Create a blob from the file
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const imageName = `${metadata.imageNo.replace(/\s/g, '')}.webp`;
      const { data, error } = await supabaseClient.storage
        .from('picaloco')
        .upload(`images/${imageName}`, blob, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Update progress
      setUploadProgress(50);
      
      // Create a smaller version for thumbnail
      // In a real app, you'd generate a proper thumbnail
      const thumbnailPath = `thumbnails/${imageName}`;
      await supabaseClient.storage
        .from('picaloco')
        .upload(thumbnailPath, blob, {
          cacheControl: '3600',
          upsert: true
        });
      
      // Update progress
      setUploadProgress(75);
      
      // Now create the metadata record in the database
      const catalogData = {
        image_no: metadata.imageNo,
        description: metadata.description,
        category: metadata.category,
        date_taken: metadata.dateTaken,
        gauge: metadata.gauge,
        // Add any other fields needed for the catalog table
      };
      
      // Insert into catalog table
      const { data: catalogRecord, error: catalogError } = await supabaseClient
        .from('catalog')
        .insert(catalogData)
        .select()
        .single();
      
      if (catalogError) throw catalogError;
      
      // Update progress
      setUploadProgress(85);
      
      // Now create related records for metadata
      if (catalogRecord && catalogRecord.id) {
        // Create catalog_metadata record
        const catalogMetadata = {
          catalog_id: catalogRecord.id,
          photographer_id: metadata.photographer,
          location_id: metadata.location,
          organisation_id: metadata.organisation,
          collection_id: metadata.collection
        };
        
        await supabaseClient
          .from('catalog_metadata')
          .insert(catalogMetadata);
        
        // Create usage rights record
        const usageData = {
          catalog_id: catalogRecord.id,
          prints_allowed: metadata.printAllowed,
          internet_use: metadata.internetUse,
          publications_use: metadata.publicationUse
        };
        
        await supabaseClient
          .from('usage')
          .insert(usageData);
        
        // Create picture_metadata record
        const pictureMetadata = {
          catalog_id: catalogRecord.id,
          file_name: imageName,
          file_location: `images/${imageName}`,
          file_type: 'webp',
          file_size: fileInfo.size,
          width: selectedImage.width,
          height: selectedImage.height,
          // Add other metadata as needed
        };
        
        await supabaseClient
          .from('picture_metadata')
          .insert(pictureMetadata);
      }
      
      // Update progress
      setUploadProgress(100);
      
      // Reset form
      setSelectedImage(null);
      setMetadata({
        imageNo: '',
        description: '',
        category: '',
        photographer: null,
        location: null,
        organisation: null,
        gauge: null,
        dateTaken: null,
        collection: null,
        printAllowed: true,
        internetUse: true,
        publicationUse: false
      });
      
      Alert.alert('Success', 'Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };
  
  // ==================== Config Functions ====================
  
  const loadAppConfig = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would load this from a settings table in your database
      // For now, we'll just use the default values set in state
      
      // This is where you'd make an API call to get the config
      // const { data, error } = await adminService.getAppConfig();
      // if (error) throw error;
      // setAppConfig(data);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error loading app config:', error);
      Alert.alert('Error', 'Failed to load app configuration');
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveAppConfig = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would save this to a settings table in your database
      // For now, we'll just show a success message
      
      // This is where you'd make an API call to save the config
      // const { error } = await adminService.saveAppConfig(appConfig);
      // if (error) throw error;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'App configuration saved successfully');
    } catch (error) {
      console.error('Error saving app config:', error);
      Alert.alert('Error', 'Failed to save app configuration');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==================== User Management Functions ====================
  
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Use the admin service to get users
      const { data, error } = await adminService.getUsers();
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      
      // Use the admin service to toggle admin role
      const { error } = await adminService.toggleAdminRole(userId, currentStatus);
      
      if (error) throw error;
      
      // Refresh user list
      await loadUsers();
      
      Alert.alert('Success', `User admin status ${currentStatus ? 'removed' : 'granted'}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      Alert.alert('Error', 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== Authorization Check ====================
  
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="lock-closed" size={48} color="#d1d5db" />
          <Text style={styles.unauthorizedText}>You do not have permission to access this area</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  


  // Handle edit requests from Photo Manager component
  const handleSaveComplete = async (photoId) => {
    try {
      // If we were in edit mode, exit it
      if (isEditMode) {
        setIsEditMode(false);
        setPhotoToEdit(null);
        
        // Show success message
        Alert.alert('Success', 'Photo updated successfully');
      } else {
        // Show success message for new photo
        Alert.alert('Success', 'Photo uploaded successfully');
      }
      
      // Refresh stats if we're on the dashboard
      if (activeTab === 'dashboard') {
        await loadStats();
      }
    } catch (error) {
      console.error('Error handling save completion:', error);
    }
  };

  // Handle cancel of edit mode
  const handleEditCancel = () => {
    setIsEditMode(false);
    setPhotoToEdit(null);
    Alert.alert('Edit Canceled', 'Changes have been discarded');
  };

  // ==================== Main Render ====================
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? "#4f46e5" : "#6b7280"} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === tab.id && styles.activeTabText
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      
      {/* Content Area */}
      {!isLoading && (
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && photoStats && (
            <View>
              {/* Statistics Dashboard */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics Overview</Text>
                
                <View>
                  <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Photos</Text>
                    <Text style={styles.statValue}>{photoStats.totalPhotos || 0}</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <View style={[styles.statCard, styles.statCardHalf]}>
                      <Text style={styles.statTitle}>Categories</Text>
                      <Text style={styles.statValue}>{photoStats.categoryStats?.length || 0}</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardHalf]}>
                      <Text style={styles.statTitle}>Photographers</Text>
                      <Text style={styles.statValue}>{photoStats.photographerStats?.length || 0}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Storage Statistics */}
                {storageStats && (
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Text style={styles.statTitle}>Storage Usage</Text>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleReduceStorage}
                      >
                        <Text style={styles.actionButtonText}>Reduce</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.statValue}>{storageStats.formattedSize}</Text>
                  </View>
                )}
              </View>
              
              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => setActiveTab('upload')}
                  >
                    <Ionicons name="cloud-upload-outline" size={28} color="#4f46e5" />
                    <Text style={styles.quickActionText}>Upload Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => setActiveTab('photos')}
                  >
                    <Ionicons name="images-outline" size={28} color="#4f46e5" />
                    <Text style={styles.quickActionText}>Manage Photos</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => setActiveTab('config')}
                  >
                    <Ionicons name="settings-outline" size={28} color="#4f46e5" />
                    <Text style={styles.quickActionText}>App Settings</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => setActiveTab('users')}
                  >
                    <Ionicons name="people-outline" size={28} color="#4f46e5" />
                    <Text style={styles.quickActionText}>Manage Users</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Recent Activity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <Text style={styles.emptyStateText}>No recent activity to display</Text>
              </View>
            </View>
          )}
          
          {/* Photos Tab Content */}
          {activeTab === 'photos' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Photo Management</Text>
                
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search photos..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={handleSearchPhotos}
                  >
                    <Ionicons name="search" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                
                {/* Photo Grid */}
                {photoList.length > 0 ? (
                  <View>
                    <Text style={styles.resultCount}>
                      Showing {photoList.length} of {totalPhotos} photos
                    </Text>
                    
                    <View style={styles.photoGrid}>
                      {photoList.map((photo) => (
                        <TouchableOpacity 
                          key={photo.image_no}
                          style={styles.photoGridItem}
                          onPress={() => handleViewPhotoDetails(photo)}
                        >
                          <Image 
                            source={{ uri: photo.thumbnail_url || photo.image_url }}
                            style={styles.photoThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.photoGridItemOverlay}>
                            <Text style={styles.photoGridItemText} numberOfLines={1}>
                              {photo.image_no}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deletePhotoButton}
                            onPress={() => handleDeletePhoto(photo)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#ffffff" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Pagination */}
                    {totalPhotos > 0 && (
                      <View style={styles.pagination}>
                        <TouchableOpacity
                          style={[styles.paginationButton, currentPage >= Math.ceil(totalPhotos / 20) && styles.paginationButtonDisabled]}
                          onPress={() => currentPage < Math.ceil(totalPhotos / 20) && loadPhotos(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(totalPhotos / 20)}
                        >
                          <Ionicons name="chevron-forward" size={20} color={currentPage >= Math.ceil(totalPhotos / 20) ? "#9ca3af" : "#4f46e5"} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="images-outline" size={48} color="#d1d5db" />
                    <Text style={styles.emptyStateTitle}>No photos found</Text>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? `No photos matching "${searchQuery}"` : 'No photos available in the database'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* Upload Tab Content */}
          {activeTab === 'upload' && (
            <View style={styles.section}>
              {/* <Text style={styles.sectionTitle}>
                {isEditMode ? 'Edit Photo' : 'Upload New Photo'}
              </Text> */}
              
              <PhotoManager 
                isEditMode={isEditMode}
                photoToEdit={photoToEdit}
                onSaveComplete={handleSaveComplete}
                onCancel={handleEditCancel}
              />
            </View>
          )}
          
          {/* Config Tab Content */}
          {activeTab === 'config' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Configuration</Text>
                
                {/* General Settings */}
                <Text style={styles.formSectionTitle}>General Settings</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>App Name</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.appName}
                    onChangeText={value => setAppConfig(prev => ({ ...prev, appName: value }))}
                    placeholder="Enter app name"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Primary Color</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.primaryColor}
                    onChangeText={value => setAppConfig(prev => ({ ...prev, primaryColor: value }))}
                    placeholder="Enter hex color code (e.g., #4f46e5)"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: appConfig.primaryColor }]} />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Secondary Color</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.secondaryColor}
                    onChangeText={value => setAppConfig(prev => ({ ...prev, secondaryColor: value }))}
                    placeholder="Enter hex color code (e.g., #ef4444)"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: appConfig.secondaryColor }]} />
                </View>
                
                {/* Content Settings */}
                <Text style={styles.formSectionTitle}>Content Settings</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Splash Screen Image URL</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.splashImageUrl}
                    onChangeText={value => setAppConfig(prev => ({ ...prev, splashImageUrl: value }))}
                    placeholder="Enter image URL"
                  />
                </View>
                
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: appConfig.splashImageUrl }}
                    style={styles.splashImagePreview}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Featured Photo ID</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.featuredPhotoId}
                    onChangeText={value => setAppConfig(prev => ({ ...prev, featuredPhotoId: value }))}
                    placeholder="Enter photo ID for featured photo"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Max Cache Size (MB)</Text>
                  <TextInput
                    style={styles.input}
                    value={appConfig.maxCacheSize.toString()}
                    onChangeText={value => {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        setAppConfig(prev => ({ ...prev, maxCacheSize: numValue }));
                      } else if (value === '') {
                        setAppConfig(prev => ({ ...prev, maxCacheSize: 0 }));
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Enter max cache size in MB"
                  />
                </View>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Enable Offline Support</Text>
                  <Switch
                    value={appConfig.offlineSupport}
                    onValueChange={value => setAppConfig(prev => ({ ...prev, offlineSupport: value }))}
                    trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                    thumbColor={appConfig.offlineSupport ? '#4f46e5' : '#9ca3af'}
                  />
                </View>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Show Prices</Text>
                  <Switch
                    value={appConfig.showPrices}
                    onValueChange={value => setAppConfig(prev => ({ ...prev, showPrices: value }))}
                    trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                    thumbColor={appConfig.showPrices ? '#4f46e5' : '#9ca3af'}
                  />
                </View>
                
                {/* Save Button */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveAppConfig}
                >
                  <Text style={styles.saveButtonText}>Save Configuration</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'favorites' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Slideshow Favorites</Text>
              <AdminFavoritesSettings />
            </View>
          )}   
          
          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Management</Text>
                <Text style={styles.infoText}>Manage user accounts and permissions.</Text>
                
                {users.length > 0 ? (
                  <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.userItem}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{item.name || 'User'}</Text>
                          <Text style={styles.userDate}>
                            Joined {new Date(item.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.userActions}>
                          <Text style={styles.roleLabel}>Admin</Text>
                          <Switch
                            value={item.isAdmin}
                            onValueChange={() => handleToggleAdmin(item.id, item.isAdmin)}
                            trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                            thumbColor="#ffffff"
                          />
                        </View>
                      </View>
                    )}
                    contentContainerStyle={styles.usersList}
                  />
                ) : (
                  <Text style={styles.emptyListText}>No users found</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Photo Detail Modal */}
      <Modal
        visible={isPhotoDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPhotoDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Photo Details</Text>
              <TouchableOpacity 
                onPress={() => setIsPhotoDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedPhoto && (
                <View>
                  <Image 
                    source={{ uri: selectedPhoto.image_url }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Image Number:</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.image_no}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.description || 'No description'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.category || 'Uncategorized'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Photographer:</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.photographer || 'Unknown'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.location || 'Unknown'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date Taken:</Text>
                    <Text style={styles.detailValue}>
                      {selectedPhoto.date_taken 
                        ? new Date(selectedPhoto.date_taken).toLocaleDateString() 
                        : 'Unknown'}
                    </Text>
                  </View>
                  
                  {selectedPhoto.gauge && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gauge:</Text>
                      <Text style={styles.detailValue}>{selectedPhoto.gauge}</Text>
                    </View>
                  )}
                  
                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        // In a real app, navigate to edit form with this photo
                        setIsPhotoDetailModalVisible(false);
                        setActiveTab('upload');
                        // Set the selected photo for editing
                        // Implementation would be more complex for a real app
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        setIsPhotoDetailModalVisible(false);
                        handleDeletePhoto(selectedPhoto);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Photo</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this photo? This action cannot be undone.
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDeletePhoto}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ebe9fe',
  },
  tabText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 24,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  
  // Dashboard styles
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statCardHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  statRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Photo management styles
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoGridItem: {
    width: '23%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoGridItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
  },
  photoGridItemText: {
    color: '#ffffff',
    fontSize: 10,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#4b5563',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Upload styles
  uploadImageContainer: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  splashImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  imagePlaceholderText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  uploadProgressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'right',
  },
  metadataForm: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    zIndex: 1000,
  },
  dateContainer: {
    zIndex: 900,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  uploadButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  uploadButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  uploadButtonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Config styles
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    right: 12,
    top: 42,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // User management styles
  usersList: {
    paddingTop: 8,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  userDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 8,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginTop: 16,
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Confirm Delete Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  confirmDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Unauthorized screen
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedText: {
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

export default AdminScreen;