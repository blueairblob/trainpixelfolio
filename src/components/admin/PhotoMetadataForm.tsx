// src/components/admin/PhotoMetadataForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectInput from '@/components/filters/SelectInput';
import DateRangeFilter from '@/components/filters/DateRangeFilter';
import { adminService, photoService } from '@/api/supabase';

export interface PhotoMetadata {
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

interface PhotoMetadataFormProps {
  initialData: PhotoMetadata;
  onChange: (data: PhotoMetadata) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

const PhotoMetadataForm: React.FC<PhotoMetadataFormProps> = ({
  initialData,
  onChange,
  isLoading = false,
  isReadOnly = false
}) => {
  const [metadata, setMetadata] = useState<PhotoMetadata>(initialData);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Reference options for dropdowns
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [photographerOptions, setPhotographerOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [organisationOptions, setOrganisationOptions] = useState<any[]>([]);
  const [gaugeOptions, setGaugeOptions] = useState<any[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<any[]>([]);
  
  // Load reference data options
  useEffect(() => {
    loadReferenceData();
  }, []);
  
  // Update parent when local state changes
  useEffect(() => {
    onChange(metadata);
  }, [metadata, onChange]);
  
  const loadReferenceData = async () => {
    try {
      setIsLoadingOptions(true);
      
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
    } finally {
      setIsLoadingOptions(false);
    }
  };
  
  // Update a specific field in metadata
  const updateField = (field: keyof PhotoMetadata, value: any) => {
    if (isReadOnly) return;
    
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  if (isLoadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading form data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Required Fields */}
      <Text style={styles.formSectionTitle}>Required Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Image Number *</Text>
        <TextInput
          style={[styles.input, isReadOnly && styles.readOnlyInput]}
          value={metadata.imageNo}
          onChangeText={value => updateField('imageNo', value)}
          placeholder="Enter image number (e.g., IMG00123)"
          editable={!isReadOnly}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, isReadOnly && styles.readOnlyInput]}
          value={metadata.description}
          onChangeText={value => updateField('description', value)}
          placeholder="Enter photo description"
          multiline={true}
          numberOfLines={3}
          editable={!isReadOnly}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.dropdownContainer}>
          <SelectInput
            label=""
            options={categoryOptions}
            selectedValue={metadata.category}
            onValueChange={value => updateField('category', value)}
            placeholder="Select a category"
            disabled={isReadOnly}
          />
        </View>
      </View>
      
      {/* Optional Fields */}
      <Text style={styles.formSectionTitle}>Additional Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date Taken</Text>
        <View style={styles.dateContainer}>
          <TextInput
            style={[styles.input, isReadOnly && styles.readOnlyInput]}
            value={metadata.dateTaken || ''}
            onChangeText={value => updateField('dateTaken', value)}
            placeholder="YYYY-MM-DD"
            editable={!isReadOnly}
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
            onValueChange={value => updateField('photographer', value)}
            placeholder="Select a photographer"
            disabled={isReadOnly}
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
            onValueChange={value => updateField('location', value)}
            placeholder="Select a location"
            disabled={isReadOnly}
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
            onValueChange={value => updateField('organisation', value)}
            placeholder="Select an organisation"
            disabled={isReadOnly}
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
            onValueChange={value => updateField('gauge', value)}
            placeholder="Select a gauge"
            disabled={isReadOnly}
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
            onValueChange={value => updateField('collection', value)}
            placeholder="Select a collection"
            disabled={isReadOnly}
          />
        </View>
      </View>
      
      {/* Usage Rights */}
      <Text style={styles.formSectionTitle}>Usage Rights</Text>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Prints Allowed</Text>
        <Switch
          value={metadata.printAllowed}
          onValueChange={value => updateField('printAllowed', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={metadata.printAllowed ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Internet Use</Text>
        <Switch
          value={metadata.internetUse}
          onValueChange={value => updateField('internetUse', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={metadata.internetUse ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Publications Use</Text>
        <Switch
          value={metadata.publicationUse}
          onValueChange={value => updateField('publicationUse', value)}
          trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
          thumbColor={metadata.publicationUse ? '#4f46e5' : '#9ca3af'}
          disabled={isReadOnly}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 24,
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
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#6b7280',
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
});

export default PhotoMetadataForm;