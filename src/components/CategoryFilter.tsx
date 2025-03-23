// CategoryFilter.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Category {
  id: string;
  title: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryPress: (category: string) => void;
}

const CategoryFilter = ({
  categories,
  activeCategory,
  onCategoryPress,
}: CategoryFilterProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            activeCategory === category.id && styles.activeCategoryItem,
          ]}
          onPress={() => onCategoryPress(category.id)}
        >
          <Text
            style={[
              styles.categoryText,
              activeCategory === category.id && styles.activeCategoryText,
            ]}
            numberOfLines={1}
          >
            {category.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    minWidth: 100,  // Set a minimum width
    alignItems: 'center',
  },
  activeCategoryItem: {
    backgroundColor: '#4f46e5',
  },
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeCategoryText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default CategoryFilter;
