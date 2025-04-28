// src/components/admin/PhotoDetailView.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

interface PhotoDetailViewProps {
  photoData: any;
  showImage?: boolean;
}

/**
 * A reusable component to display photo details in a structured format
 */
const PhotoDetailView: React.FC<PhotoDetailViewProps> = ({ 
  photoData, 
  showImage = true 
}) => {
  if (!photoData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photo data available</Text>
      </View>
    );
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Group data into sections for better organization
  const basicInfo = [
    { label: 'Image Number', value: photoData.image_no },
    { label: 'Description', value: photoData.description || 'No description' },
    { label: 'Category', value: photoData.category || 'Uncategorized' },
    { label: 'Date Taken', value: formatDate(photoData.date_taken) },
  ];

  const metadataInfo = [
    { label: 'Photographer', value: photoData.photographer || 'Unknown' },
    { label: 'Location', value: photoData.location || 'Unknown' },
    { label: 'Organisation', value: photoData.organisation || 'Unknown' },
    { label: 'Collection', value: photoData.collection || 'None' },
  ];

  const technicalInfo = [
    { label: 'Gauge', value: photoData.gauge || 'Not specified' },
    { label: 'Width', value: photoData.width ? `${photoData.width}px` : 'Unknown' },
    { label: 'Height', value: photoData.height ? `${photoData.height}px` : 'Unknown' },
    { label: 'File Type', value: photoData.file_type || 'Unknown' },
  ];

  const usageInfo = [
    { label: 'Prints Allowed', value: photoData.prints_allowed ? 'Yes' : 'No' },
    { label: 'Internet Use', value: photoData.internet_use ? 'Yes' : 'No' },
    { label: 'Publications Use', value: photoData.publications_use ? 'Yes' : 'No' },
  ];

  const builderInfo = photoData.builder_name ? [
    { label: 'Builder', value: photoData.builder_name },
    { label: 'Works Number', value: photoData.works_number || 'Not specified' },
    { label: 'Year Built', value: photoData.year_built || 'Unknown' },
  ] : [];

  // Render a section of detail items
  const renderSection = (title: string, items: Array<{ label: string, value: string }>) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailLabel}>{item.label}:</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {showImage && photoData.image_url && (
        <Image 
          source={{ uri: photoData.image_url }}
          style={styles.photo}
          resizeMode="contain"
        />
      )}

      {renderSection('Basic Information', basicInfo)}
      {renderSection('Metadata', metadataInfo)}
      {builderInfo.length > 0 && renderSection('Builder Information', builderInfo)}
      {renderSection('Technical Details', technicalInfo)}
      {renderSection('Usage Rights', usageInfo)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
});

export default PhotoDetailView;