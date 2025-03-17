
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { allPhotos } from '../../services/photoService';

// Placeholder for now - we'll replace with a native version of our filter functionality
const GalleryScreen = ({ navigation, route }) => {
  const [photos, setPhotos] = useState(allPhotos);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'compact', or 'single'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(route.params?.category || 'all');

  // Categories for filter
  const categories = [
    { id: 'all', title: 'All Photos' },
    { id: 'steam', title: 'Steam Locomotives' },
    { id: 'modern', title: 'Modern Trains' },
    { id: 'stations', title: 'Railway Stations' },
    { id: 'scenic', title: 'Scenic Railways' },
  ];

  // Filter photos based on selected category
  const filteredPhotos = activeCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.tags.includes(activeCategory));

  // Render photo item based on view mode
  const renderPhotoItem = ({ item }) => {
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => navigation.navigate('PhotoDetail', { id: item.id })}
        >
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.gridItemInfo}>
            <Text style={styles.gridItemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.gridItemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (viewMode === 'compact') {
      return (
        <TouchableOpacity 
          style={styles.compactItem}
          onPress={() => navigation.navigate('PhotoDetail', { id: item.id })}
        >
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.compactImage}
            resizeMode="cover"
          />
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.compactPhotographer}>{item.photographer}</Text>
            <View style={styles.compactFooter}>
              <Text style={styles.compactPrice}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.compactButton}>
                <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else { // single view
      return (
        <View style={styles.singleItem}>
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.singleImage}
            resizeMode="cover"
          />
          <View style={styles.singleInfo}>
            <Text style={styles.singleTitle}>{item.title}</Text>
            <Text style={styles.singlePhotographer}>By {item.photographer}</Text>
            <Text style={styles.singleLocation}>{item.location}</Text>
            <Text style={styles.singleDescription} numberOfLines={3}>{item.description}</Text>
            <View style={styles.singleFooter}>
              <Text style={styles.singlePrice}>${item.price.toFixed(2)}</Text>
              <View style={styles.singleButtons}>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => navigation.navigate('PhotoDetail', { id: item.id })}
                >
                  <Text style={styles.detailButtonText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="cart-outline" size={16} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter-outline" size={20} color="#4f46e5" />
          </TouchableOpacity>
          <View style={styles.viewModeButtons}>
            <TouchableOpacity 
              style={[
                styles.viewModeButton, 
                viewMode === 'grid' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? "#4f46e5" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewModeButton, 
                viewMode === 'compact' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('compact')}
            >
              <Ionicons name="list-outline" size={20} color={viewMode === 'compact' ? "#4f46e5" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewModeButton, 
                viewMode === 'single' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('single')}
            >
              <Ionicons name="square-outline" size={20} color={viewMode === 'single' ? "#4f46e5" : "#6b7280"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollView}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              activeCategory === category.id && styles.activeCategoryChip
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text 
              style={[
                styles.categoryChipText,
                activeCategory === category.id && styles.activeCategoryChipText
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Photo List */}
      <FlatList
        data={filteredPhotos}
        renderItem={renderPhotoItem}
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

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Photos</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSectionTitle}>Categories</Text>
            <View style={styles.modalCategories}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalCategoryChip,
                    activeCategory === category.id && styles.modalActiveCategoryChip
                  ]}
                  onPress={() => {
                    setActiveCategory(category.id);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.modalCategoryChipText,
                      activeCategory === category.id && styles.modalActiveCategoryChipText
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* We'd add more filter options here in a full implementation */}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setActiveCategory('all');
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    padding: 6,
    borderRadius: 6,
  },
  activeViewModeButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoriesScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#4f46e5',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeCategoryChipText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  photosList: {
    padding: 12,
  },
  // Grid view styles
  gridItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridItemInfo: {
    padding: 8,
  },
  gridItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  gridItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  // Compact view styles
  compactItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  compactPhotographer: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  compactButton: {
    padding: 4,
  },
  // Single view styles
  singleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  singleInfo: {
    padding: 16,
  },
  singleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  singlePhotographer: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  singleLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  singleDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  singleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singlePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  singleButtons: {
    flexDirection: 'row',
  },
  detailButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#4f46e5',
  },
  addButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Empty state
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modalCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  modalCategoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  modalActiveCategoryChip: {
    backgroundColor: '#4f46e5',
  },
  modalCategoryChipText: {
    fontSize: 14,
    color: '#4b5563',
  },
  modalActiveCategoryChipText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default GalleryScreen;
