
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CategoryFilter = ({ categories, activeCategory, onCategoryPress }) => {
  return (
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
          onPress={() => onCategoryPress(category.id)}
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
  );
};

const styles = StyleSheet.create({
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
});

export default CategoryFilter;
