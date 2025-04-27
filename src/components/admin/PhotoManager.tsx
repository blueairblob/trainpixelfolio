// src/components/admin/PhotoManager.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabaseClient } from '@/api/supabase/client';
import { adminService, photoService, photoAdminService } from '@/api/supabase';
import SelectInput from '@/components/filters/SelectInput';

// Types
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
  builder: string | null;
  worksNumber: string | null;
  yearBuilt: string | null;
}

interface PhotoManagerProps {
  isEditMode?: boolean;
  photoToEdit?: any; // The photo data to edit
  onSaveComplete?: (photoId: string) => void;
  onCancel?: () => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
  isEditMode = false,
  photoToEdit,
  onSaveComplete,
  onCancel
}) => {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showBuilderFields, setShowBuilderFields] = useState(false);
  
  // Reference options for dropdowns
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [photographerOptions, setPhotographerOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [organisationOptions, setOrganisationOptions] = useState<any[]>([]);
  const [gaugeOptions, setGaugeOptions] = useState<any[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<any[]>([]);
  const [builderOptions, setBuilderOptions] = useState<any[]>([]);
  
  // Form state
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
    publicationUse: false,
    builder: null,
    worksNumber: null,
    yearBuilt: null
  });
  
  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, []);
  
  // Set up form for edit mode when photoToEdit changes
  useEffect(() => {
    if (isEditMode && photoToEdit) {
      populateFormWithPhotoData();
    }
  }, [isEditMode, photoToEdit]);
  
  // Load reference data (categories, photographers, etc.)
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
      
      // Fetch builders
      const { data: builders } = await adminService.builders.getAll();
      setBuilderOptions(builders?.map(b => ({ id: b.id, name: b.name })) || []);
      
    } catch (error) {
      console.error('Error loading reference data:', error);
      Alert.alert('Error', 'Failed to load reference data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Populate the form with the photo data when in edit mode
  const populateFormWithPhotoData = async () => {
    if (!photoToEdit) return;
    
    try {
      setIsLoading(true);
      
      // If we have a complete flattened object already (from AdminScreen)
      if (photoToEdit.flattened) {
        const flat = photoToEdit.flattened;
        setupFormFromFlattenedData(flat);
        return;
      }
      
      // Otherwise get complete photo data using the admin service
      const { data, error } = await photoAdminService.getCompletePhotoData(photoToEdit.id);
      
      if (error) throw error;
      if (!data) throw new Error("Failed to load photo data");
      
      // Use the flattened data for easier form handling
      const flat = data.flattened;
      setupFormFromFlattenedData(flat);
      
    } catch (error) {
      console.error('Error loading photo data:', error);
      Alert.alert('Error', 'Failed to load complete photo data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to setup form from flattened data
  const setupFormFromFlattenedData = (flat: any) => {
    // Set the form values from the photo data
    setMetadata({
      imageNo: flat.image_no || '',
      description: flat.description || '',
      category: flat.category || '',
      photographer: flat.photographer_id || null,
      location: flat.location_id || null,
      organisation: flat.organisation_id || null,
      gauge: flat.gauge || null,
      dateTaken: flat.date_taken || null,
      collection: flat.collection_id || null,
      printAllowed: flat.prints_allowed === true,
      internetUse: flat.internet_use === true,
      publicationUse: flat.publications_use === true,
      builder: flat.builder_id || null,
      worksNumber: flat.works_number || null,
      yearBuilt: flat.year_built || null
    });
    
    // Show builder fields if we have builder data
    setShowBuilderFields(!!flat.builder_id);
    
    // Set image URL for preview in edit mode
    if (flat.image_url || photoToEdit.image_url) {
      setSelectedImage({
        isRemoteImage: true,
        uri: flat.image_url || photoToEdit.image_url
      });
    }
  };
  
  // Pick an image from the gallery
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
        setSelectedImage({
          ...selectedAsset,
          isRemoteImage: false
        });
        
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
        
        // Try to extract an image number from the filename if we're not in edit mode
        if (!isEditMode && selectedAsset.fileName) {
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
  
  // Upload a new image and save metadata
  const uploadImage = async () => {
    if (!selectedImage && !isEditMode) {
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
      
      // If this is a new upload (not edit) or we have a new image in edit mode
      let imageUrl = null;
      if (selectedImage && !selectedImage.isRemoteImage) {
        // Upload the new image
        const uri = selectedImage.uri;
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }
        
        // Create a blob from the file
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Upload to Supabase Storage
        const imageName = `${metadata.imageNo.replace(/\\s/g, '')}.webp`;
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
        const thumbnailPath = `thumbnails/${imageName}`;
        await supabaseClient.storage
          .from('picaloco')
          .upload(thumbnailPath, blob, {
            cacheControl: '3600',
            upsert: true
          });
        
        // Get the image URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('picaloco')
          .getPublicUrl(`images/${imageName}`);
          
        imageUrl = publicUrl;
        
        // Update progress
        setUploadProgress(75);
      }
      
      // Update progress
      setUploadProgress(80);
      
      if (isEditMode && photoToEdit) {
        // Update existing photo
        const { error } = await photoAdminService.updatePhoto(photoToEdit.id, {
          imageNo: metadata.imageNo,
          description: metadata.description,
          category: metadata.category,
          dateTaken: metadata.dateTaken,
          gauge: metadata.gauge,
          photographer: metadata.photographer,
          location: metadata.location,
          organisation: metadata.organisation,
          collection: metadata.collection,
          printAllowed: metadata.printAllowed,
          internetUse: metadata.internetUse,
          publicationUse: metadata.publicationUse,
          builder: showBuilderFields ? metadata.builder : null,
          worksNumber: showBuilderFields ? metadata.worksNumber : null,
          yearBuilt: showBuilderFields ? metadata.yearBuilt : null,
        });
        
        if (error) throw error;
        
        // Update progress
        setUploadProgress(100);
        
        // Call the completion handler with the photo ID
        if (onSaveComplete) {
          onSaveComplete(photoToEdit.id);
        }
        
        Alert.alert('Success', 'Photo updated successfully');
      } else {
        // Create new photo record
        // Prepare data for catalog table
        const catalogData = {
          image_no: metadata.imageNo,
          description: metadata.description,
          category: metadata.category,
          date_taken: metadata.dateTaken,
          gauge: metadata.gauge,
        };
        
        // Insert into catalog table
        const { data: catalogRecord, error: catalogError } = await supabaseClient
          .from('catalog')
          .insert(catalogData)
          .select()
          .single();
        
        if (catalogError) throw catalogError;
        
        if (!catalogRecord) {
          throw new Error("Failed to create catalog record");
        }
        
        // Update progress
        setUploadProgress(85);
        
        // Create related records for the new photo
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
            file_name: `${metadata.imageNo.replace(/\\s/g, '')}.webp`,
            file_location: `images/${metadata.imageNo.replace(/\\s/g, '')}.webp`,
            file_type: 'webp',
            file_size: selectedImage.fileSize,
            width: selectedImage.width,
            height: selectedImage.height,
          };
          
          await supabaseClient
            .from('picture_metadata')
            .insert(pictureMetadata);
            
          // Add builder info if provided
          if (showBuilderFields && metadata.builder) {
            const builderData = {
              catalog_id: catalogRecord.id,
              builder_id: metadata.builder,
              works_number: metadata.worksNumber,
              year_built: metadata.yearBuilt,
              builder_order: 1,
              created_by: 'admin',
              created_date: new Date().toISOString()
            };
            
            await supabaseClient
              .from('catalog_builder')
              .insert(builderData);
          }
          
          // Update progress
          setUploadProgress(100);
          
          // Call the completion handler with the new photo ID
          if (onSaveComplete) {
            onSaveComplete(catalogRecord.id);
          }
        }
        
        Alert.alert('Success', 'Photo uploaded successfully');
        
        // Reset form for new uploads
        resetForm();
      }
    } catch (error) {
      console.error('Error uploading/updating image:', error);
      Alert.alert('Error', 'Failed to process photo: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Reset the form for new uploads
  const resetForm = () => {
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
      publicationUse: false,
      builder: null,
      worksNumber: null,
      yearBuilt: null
    });
    setShowBuilderFields(false);
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      resetForm();
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isEditMode ? 'Edit Photo' : 'Upload New Photo'}
      </Text>
      
      {/* Image Preview */}
      <View style={styles.uploadImageContainer}>
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={pickImage}
          >
            <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
            <Text style={styles.imagePlaceholderText}>
              {isEditMode ? 'Tap to change image' : 'Tap to select an image'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.uploadProgressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[styles.progressBar, { width: `${uploadProgress}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress}% Complete</Text>
        </View>
      )}
      
      {/* Metadata Form */}
      <View style={styles.metadataForm}>
        <Text style={styles.formSectionTitle}>Photo Metadata</Text>
        
        {/* Required Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image Number *</Text>
          <TextInput
            style={styles.input}
            value={metadata.imageNo}
            onChangeText={value => setMetadata(prev => ({ ...prev, imageNo: value }))}
            placeholder="Enter image number (e.g., IMG00123)"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={metadata.description}
            onChangeText={value => setMetadata(prev => ({ ...prev, description: value }))}
            placeholder="Enter photo description"
            multiline={true}
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={categoryOptions}
              selectedValue={metadata.category}
              onValueChange={value => setMetadata(prev => ({ ...prev, category: value }))}
              placeholder="Select a category"
            />
          </View>
        </View>
        
        {/* Optional Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date Taken</Text>
          <View style={styles.dateContainer}>
            <TextInput
              style={styles.input}
              value={metadata.dateTaken || ''}
              onChangeText={value => setMetadata(prev => ({ ...prev, dateTaken: value }))}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Photographer</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={photographerOptions}
              selectedValue={metadata.photographer}
              onValueChange={value => setMetadata(prev => ({ ...prev, photographer: value }))}
              placeholder="Select a photographer"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={locationOptions}
              selectedValue={metadata.location}
              onValueChange={value => setMetadata(prev => ({ ...prev, location: value }))}
              placeholder="Select a location"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Organisation</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={organisationOptions}
              selectedValue={metadata.organisation}
              onValueChange={value => setMetadata(prev => ({ ...prev, organisation: value }))}
              placeholder="Select an organisation"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Gauge</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={gaugeOptions}
              selectedValue={metadata.gauge}
              onValueChange={value => setMetadata(prev => ({ ...prev, gauge: value }))}
              placeholder="Select a gauge"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Collection</Text>
          <View style={styles.dropdownContainer}>
            <SelectInput
              label=""
              options={collectionOptions}
              selectedValue={metadata.collection}
              onValueChange={value => setMetadata(prev => ({ ...prev, collection: value }))}
              placeholder="Select a collection"
            />
          </View>
        </View>
        
        {/* Builder information toggle */}
        <View style={styles.builderToggleContainer}>
          <TouchableOpacity 
            style={styles.builderToggle}
            onPress={() => setShowBuilderFields(!showBuilderFields)}
          >
            <Text style={styles.builderToggleText}>
              {showBuilderFields ? 'Hide Builder Information' : 'Add Builder Information'}
            </Text>
            <Ionicons 
              name={showBuilderFields ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color="#4f46e5"
            />
          </TouchableOpacity>
        </View>
        
        {/* Builder fields */}
        {showBuilderFields && (
          <>
            <Text style={styles.formSectionTitle}>Builder Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Builder</Text>
              <View style={styles.dropdownContainer}>
                <SelectInput
                  label=""
                  options={builderOptions}
                  selectedValue={metadata.builder}
                  onValueChange={value => setMetadata(prev => ({ ...prev, builder: value }))}
                  placeholder="Select a builder"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Works Number</Text>
              <TextInput
                style={styles.input}
                value={metadata.worksNumber || ''}
                onChangeText={value => setMetadata(prev => ({ ...prev, worksNumber: value }))}
                placeholder="Enter works number"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Year Built</Text>
              <TextInput
                style={styles.input}
                value={metadata.yearBuilt || ''}
                onChangeText={value => setMetadata(prev => ({ ...prev, yearBuilt: value }))}
                placeholder="Enter year built (e.g., 1956)"
                keyboardType="numeric"
              />
            </View>
          </>
        )}
        
        {/* Usage Rights */}
        <Text style={styles.formSectionTitle}>Usage Rights</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Prints Allowed</Text>
          <Switch
            value={metadata.printAllowed}
            onValueChange={value => setMetadata(prev => ({ ...prev, printAllowed: value }))}
            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
            thumbColor={metadata.printAllowed ? '#4f46e5' : '#9ca3af'}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Internet Use</Text>
          <Switch
            value={metadata.internetUse}
            onValueChange={value => setMetadata(prev => ({ ...prev, internetUse: value }))}
            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
            thumbColor={metadata.internetUse ? '#4f46e5' : '#9ca3af'}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Publications Use</Text>
          <Switch
            value={metadata.publicationUse}
            onValueChange={value => setMetadata(prev => ({ ...prev, publicationUse: value }))}
            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
            thumbColor={metadata.publicationUse ? '#4f46e5' : '#9ca3af'}
          />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedImage && !isEditMode) || isUploading ? styles.saveButtonDisabled : {}
            ]}
            onPress={uploadImage}
            disabled={(!selectedImage && !isEditMode) || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Save Changes' : 'Upload Photo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
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
    marginTop: 8,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 20,
    marginBottom: 12,
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
  builderToggleContainer: {
    marginVertical: 16,
  },
  builderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  builderToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default PhotoManager;