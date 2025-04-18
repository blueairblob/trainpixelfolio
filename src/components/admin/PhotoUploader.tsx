// src/components/admin/PhotoUploader.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { supabaseClient } from '@/api/supabase/client';

interface PhotoUploaderProps {
  onImageSelected: (image: any) => void;
  onUploadComplete?: (imageUrl: string) => void;
  selectedImage: any;
  onError?: (error: Error) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  onUploadComplete,
  selectedImage,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Pick image from library
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
        onImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      if (onError) onError(error as Error);
    }
  };
  
  // Upload selected image to storage
  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image to upload');
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
      
      // Generate a unique filename based on timestamp
      const timestamp = Date.now();
      const filename = `upload_${timestamp}.webp`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('picaloco')
        .upload(`uploads/${filename}`, blob, {
          cacheControl: '3600',
          upsert: true,
          // Progress handler would be here in a real implementation
          // For now we'll simulate progress
        });
      
      if (error) throw error;
      
      // Update progress
      setUploadProgress(50);
      
      // Simulate additional processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(75);
      
      // Get the public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('picaloco')
        .getPublicUrl(`uploads/${filename}`);
      
      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadProgress(100);
      
      // Call completion handler with the URL
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (onError) onError(error as Error);
      throw error;
    } finally {
      // Reset upload state after a delay to show 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };
  
  return (
    <View style={styles.container}>
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
              onPress={() => onImageSelected(null)}
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
            <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.uploadProgressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${uploadProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress}% Uploaded</Text>
        </View>
      )}
      
      {/* Upload Button */}
      {selectedImage && !isUploading && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={uploadImage}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" style={styles.uploadButtonIcon} />
          <Text style={styles.uploadButtonText}>Upload Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  uploadButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhotoUploader;