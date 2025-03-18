
import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoItem from './PhotoItem';

const PhotoList = ({ photos, viewMode, onPhotoPress, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={({ item }) => (
        <PhotoItem 
          photo={item} 
          viewMode={viewMode} 
          onPress={onPhotoPress} 
        />
      )}
      keyExtractor={item => item.id}
      numColumns={viewMode === 'grid' ? 2 : 1}
      key={viewMode === 'grid' ? 'grid' : 'list'}
      contentContainerStyle={styles.photosList}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No photos found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  photosList: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});

export default PhotoList;
