
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  title: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: string;
  onCategoryPress: (category: string) => void;
  onClearFilters: () => void;
}

const FilterModal = ({ 
  visible, 
  onClose, 
  categories, 
  activeCategory, 
  onCategoryPress,
  onClearFilters
}: FilterModalProps) => {
  // Add state for additional filters
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<string | null>(null);
  
  // Sample data for dropdowns
  const locations = ['London', 'Paris', 'New York', 'Tokyo', 'Sydney'];
  const tags = ['Vintage', 'Modern', 'Black and White', 'Landscape', 'Portrait'];
  
  // Toggle location selection
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    // Here we would combine all filters and apply them
    // For now, we'll just close the modal
    onClose();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedLocations([]);
    setSelectedTags([]);
    setOrientation(null);
    setPriceRange([0, 100]);
    onClearFilters();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Photos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      activeCategory === category.id && styles.activeCategoryItem
                    ]}
                    onPress={() => onCategoryPress(category.id)}
                  >
                    <Text 
                      style={[
                        styles.categoryText,
                        activeCategory === category.id && styles.activeCategoryText
                      ]}
                    >
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Locations Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Locations</Text>
              <View style={styles.optionsContainer}>
                {locations.map((location) => (
                  <TouchableOpacity 
                    key={location}
                    style={styles.optionRow}
                    onPress={() => toggleLocation(location)}
                  >
                    <Text style={styles.optionText}>{location}</Text>
                    <View style={[
                      styles.checkbox,
                      selectedLocations.includes(location) && styles.checkboxSelected
                    ]}>
                      {selectedLocations.includes(location) && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Tags Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.optionsContainer}>
                {tags.map((tag) => (
                  <TouchableOpacity 
                    key={tag}
                    style={styles.optionRow}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={styles.optionText}>{tag}</Text>
                    <View style={[
                      styles.checkbox,
                      selectedTags.includes(tag) && styles.checkboxSelected
                    ]}>
                      {selectedTags.includes(tag) && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Orientation Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Orientation</Text>
              <View style={styles.orientationContainer}>
                <TouchableOpacity 
                  style={[
                    styles.orientationButton, 
                    orientation === 'landscape' && styles.activeOrientationButton
                  ]}
                  onPress={() => setOrientation(orientation === 'landscape' ? null : 'landscape')}
                >
                  <Text style={[
                    styles.orientationText,
                    orientation === 'landscape' && styles.activeOrientationText
                  ]}>
                    Landscape
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.orientationButton, 
                    orientation === 'portrait' && styles.activeOrientationButton
                  ]}
                  onPress={() => setOrientation(orientation === 'portrait' ? null : 'portrait')}
                >
                  <Text style={[
                    styles.orientationText,
                    orientation === 'portrait' && styles.activeOrientationText
                  ]}>
                    Portrait
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: '70%',
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  activeCategoryItem: {
    backgroundColor: '#4f46e5',
  },
  categoryText: {
    color: '#4b5563',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  orientationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  orientationButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeOrientationButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  orientationText: {
    fontSize: 16,
    color: '#4b5563',
  },
  activeOrientationText: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default FilterModal;
