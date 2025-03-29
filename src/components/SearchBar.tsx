// SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (text: string) => void;
  onClear?: () => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, initialValue = '' }) => {
  const [searchText, setSearchText] = useState(initialValue);
  
  // Update internal state when initialValue changes
  useEffect(() => {
    console.log('SearchBar initialValue changed to:', initialValue);
    setSearchText(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleClear = () => {
    console.log('Clear button pressed');
    setSearchText('');
    if (onClear) {
      onClear();
    } else {
      onSearch('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search train photos..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
            activeOpacity={0.6}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 6, // Increased padding for larger touch target
  },
});

export default SearchBar;