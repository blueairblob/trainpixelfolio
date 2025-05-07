// SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (text: string) => void;
  onClear?: () => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  executeOnChange?: boolean; // New prop to control if search executes while typing
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  initialValue = '',
  placeholder = 'Search train photos...',
  autoFocus = false,
  executeOnChange = false // Default to false - only search on submit
}) => {
  const [searchText, setSearchText] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  // Update internal state when initialValue changes
  useEffect(() => {
    if (initialValue !== searchText) {
      setSearchText(initialValue);
    }
  }, [initialValue]);

  // Handle text change - only execute search if executeOnChange is true
  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    // If text is empty, clear immediately
    if (!text.trim()) {
      if (onClear) {
        onClear();
      } else {
        onSearch('');
      }
      return;
    }
    
    // Only execute search while typing if explicitly enabled
    if (executeOnChange) {
      onSearch(text);
    }
  };

  // Handle submit (pressing enter/search on keyboard or search icon)
  const handleSubmit = () => {
    // Execute search immediately on submit
    if (searchText.trim()) {
      onSearch(searchText);
    }
    Keyboard.dismiss();
  };

  // Handle clear button press
  const handleClear = () => {
    setSearchText('');
    if (onClear) {
      onClear();
    } else {
      onSearch('');
    }
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          onPress={handleSubmit}
          style={styles.searchIcon}
        >
          <Ionicons name="search" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"  // Added explicit placeholder text color
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          clearButtonMode="never" // We'll provide our own clear button
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
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
  searchIcon: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    // Removed paddingVertical comment since it was unnecessary
  },
  clearButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default SearchBar;