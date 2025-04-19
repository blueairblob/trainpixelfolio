// src/components/admin/AppConfigForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export interface AppConfig {
  appName: string;
  splashImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  featuredPhotoId: string;
  maxCacheSize: number;
  offlineSupport: boolean;
  showPrices: boolean;
  showFavorites: boolean;
}

interface AppConfigFormProps {
  initialConfig: AppConfig;
  onChange: (config: AppConfig) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

const AppConfigForm: React.FC<AppConfigFormProps> = ({
  initialConfig,
  onChange,
  onSave,
  isLoading = false,
  isReadOnly = false
}) => {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [pickingImage, setPickingImage] = useState(false);
  
  // Update parent when local state changes
  useEffect(() => {
    onChange(config);
  }, [config, onChange]);
  
  // Update a specific field in config
  const updateField = (field: keyof AppConfig, value: any) => {
    if (isReadOnly) return;
    
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle picking a splash image
  const pickSplashImage = async () => {
    if (isReadOnly) return;
    
    try {
      setPickingImage(true);
      
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real implementation, you would upload this image to your server
        // and then use the returned URL. For now, we'll just use the local URI
        // as a demonstration.
        updateField('splashImageUrl', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setPickingImage(false);
    }
  };
  
  // Validate hex color
  const isValidHexColor = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* General Settings */}
      <Text style={styles.sectionTitle}>General Settings</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>App Name</Text>
        <TextInput
          style={[styles.input, isReadOnly && styles.readOnlyInput]}
          value={config.appName}
          onChangeText={value => updateField('appName', value)}
          placeholder="Enter app name"
          editable={!isReadOnly}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Primary Color</Text>
        <View style={styles.colorInputContainer}>
          <TextInput
            style={[styles.input, isReadOnly && styles.readOnlyInput]}
            value={config.primaryColor}
            onChangeText={value => updateField('primaryColor', value)}
            placeholder="Enter hex color code (e.g., #4f46e5)"
            editable={!isReadOnly}
          />
          <View 
            style={[
              styles.colorPreview, 
              { backgroundColor: isValidHexColor(config.primaryColor) ? config.primaryColor : '#cccccc' }
            ]} 
          />
        </View>
        {config.primaryColor && !isValidHexColor(config.primaryColor) && (
          <Text style={styles.errorText}>Please enter a valid hex color (e.g., #4f46e5)</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Secondary Color</Text>
        <View style={styles.colorInputContainer}>
          <TextInput
            style={[styles.input, isReadOnly && styles.readOnlyInput]}
            value={config.secondaryColor}
            onChangeText={value => updateField('secondaryColor', value)}
            placeholder="Enter hex color code (e.g., #ef4444)"
            editable={!isReadOnly}
          />
          <View 
            style={[
              styles.colorPreview, 
              { backgroundColor: isValidHexColor(config.secondaryColor) ? config.secondaryColor : '#cccccc' }
            ]} 
          />
        </View>
        {config.secondaryColor && !isValidHexColor(config.secondaryColor) && (
          <Text style={styles.errorText}>Please enter a valid hex color (e.g., #ef4444)</Text>
        )}
      </View>
      
      {/* Content Settings */}
      <Text style={styles.sectionTitle}>Content Settings</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Splash Screen Image</Text>
        <View style={styles.splashImageContainer}>
          <Image 
            source={{ uri: config.splashImageUrl }}
            style={styles.splashImagePreview}
            resizeMode="cover"
          />
          {!isReadOnly && (
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={pickSplashImage}
              disabled={pickingImage}
            >
              {pickingImage ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.changeImageText}>Change Image</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Featured Photo ID</Text>
        <TextInput
          style={[styles.input, isReadOnly && styles.readOnlyInput]}
          value={config.featuredPhotoId}
          onChangeText={value => updateField('featuredPhotoId', value)}
          placeholder="Enter photo ID for featured photo"
          editable={!isReadOnly}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Max Cache Size (MB)</Text>
        <TextInput
          style={[styles.input, isReadOnly && styles.readOnlyInput]}
          value={config.maxCacheSize.toString()}
          onChangeText={value => {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              updateField('maxCacheSize', numValue);
            } else if (value === '') {
              updateField('maxCacheSize', 0);
            }
          }}
          keyboardType="numeric"
          placeholder="Enter max cache size in MB"
          editable={!isReadOnly}
        />
      </View>
      
      {/* Feature Toggles */}
      <Text style={styles.sectionTitle}>Feature Toggles</Text>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Offline Support</Text>
        <Switch
          value={config.offlineSupport}
          onValueChange={value => updateField('offlineSupport', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={config.offlineSupport ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Show Prices</Text>
        <Switch
          value={config.showPrices}
          onValueChange={value => updateField('showPrices', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={config.showPrices ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Show Favorites</Text>
        <Switch
          value={config.showFavorites}
          onValueChange={value => updateField('showFavorites', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={config.showFavorites ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
      
      {/* Save Button */}
      {!isReadOnly && (
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={isLoading || 
            !isValidHexColor(config.primaryColor) || 
            !isValidHexColor(config.secondaryColor)}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 24,
    marginBottom: 16,
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
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#6b7280',
  },
  colorInputContainer: {
    position: 'relative',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    right: 12,
    top: 9,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  splashImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  splashImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppConfigForm;