
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoItem from './PhotoItem';

interface Photo {
  id: string;
  title: string;
  photographer: string;
  price: number;
  imageUrl: string;
  location: string;
  description: string;
}

interface PhotoListProps {
  photos: Photo[];
  viewMode: 'grid' | 'compact' | 'single';
  onPhotoPress: (id: string) => void;
}

const PhotoList = ({ photos, viewMode, onPhotoPress }: PhotoListProps) => {
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
