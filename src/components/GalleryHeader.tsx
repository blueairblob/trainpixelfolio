// GalleryHeader.tsx - Alternative fix with built-in SafeAreaView
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface GalleryHeaderProps {
  onFilterPress: () => void;
  viewMode: 'grid' | 'compact' | 'single';
  setViewMode: (mode: 'grid' | 'compact' | 'single') => void;
}

const GalleryHeader = ({ onFilterPress, viewMode, setViewMode }: GalleryHeaderProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onFilterPress}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
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
});

export default GalleryHeader;