import React from 'react';
import { FlatList, View } from 'react-native';
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
  refreshControl?: React.ReactElement;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

const PhotoList: React.FC<PhotoListProps> = ({
  photos,
  viewMode,
  onPhotoPress,
  refreshControl,
  onEndReached,
  onEndReachedThreshold,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
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
      key={viewMode} // Forces re-render when viewMode changes
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={{ padding: viewMode === 'grid' ? 0 : 8 }}
    />
  );
};

export default PhotoList;