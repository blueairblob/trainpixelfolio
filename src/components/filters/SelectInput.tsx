// src/components/filters/SelectInput.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from '@/hooks/useDebounce';

interface SelectInputProps {
  label: string;
  options: { id: string; name: string }[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = true,
  loading = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);

  // Find the selected option
  const selectedOption = options.find(option => option.id === selectedValue);

  // Filter options based on search text
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
  );

  // Open modal
  const openModal = () => {
    if (disabled) return;
    setSearchText(''); // Clear search when opening
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSearchText('');
  };

  // Handle option selection
  const handleSelect = (value: string) => {
    onValueChange(value);
    closeModal();
  };

  // Handle clearing selection
  const handleClear = () => {
    onValueChange(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.selectContainer, disabled && styles.disabled]} 
        onPress={openModal}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4f46e5" />
        ) : selectedOption ? (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedText} numberOfLines={1}>
              {selectedOption.name}
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
        <Ionicons name="chevron-down" size={18} color="#9ca3af" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.id === selectedValue && styles.selectedOption
                    ]}
                    onPress={() => handleSelect(item.id)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        item.id === selectedValue && styles.selectedOptionText
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.id === selectedValue && (
                      <Ionicons name="checkmark" size={20} color="#4f46e5" />
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.optionsList}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No options found</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  selectContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  selectedContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    color: '#1f2937',
    fontSize: 14,
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
    flex: 1,
  },
  clearButton: {
    marginRight: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    padding: 8,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectedOptionText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default SelectInput;