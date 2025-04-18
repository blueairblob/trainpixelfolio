// src/components/admin/ComboBoxInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from '@/hooks/useDebounce';
import { adminService } from '@/api/supabase';

interface Option {
  id: string;
  name: string;
}

interface ComboBoxInputProps {
  label: string;
  options: Option[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowNewValues?: boolean;
  entityType?: string; // e.g., 'photographer', 'location', etc.
}

const ComboBoxInput: React.FC<ComboBoxInputProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  loading = false,
  allowNewValues = true,
  entityType
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);
  const inputRef = useRef<TextInput>(null);

  // Find the selected option
  const selectedOption = options.find(option => option.id === selectedValue);
  const selectedDisplay = selectedOption?.name || '';

  // Filter options based on search text
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
  );

  // Check if current search is not in options
  const isNewValue = debouncedSearchText && 
    !options.some(option => 
      option.name.toLowerCase() === debouncedSearchText.toLowerCase()
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
    setIsCreatingNew(false);
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

  // Handle creating a new option
  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setCustomValue(searchText);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Save the new custom option to the database
  const handleSaveNewOption = async () => {
    if (!customValue.trim() || !entityType) {
      return;
    }

    setIsSaving(true);

    try {
      // Create new entity based on entityType
      let newEntity;
      switch (entityType) {
        case 'photographer':
          const { data: photographer } = await adminService.photographers.create({ 
            name: customValue.trim(),
            created_by: 'system' // This would ideally come from auth context
          });
          newEntity = photographer;
          break;

        case 'location':
          const { data: location } = await adminService.locations.create({ 
            name: customValue.trim(),
            created_by: 'system'
          });
          newEntity = location;
          break;

        case 'organisation':
          const { data: org } = await adminService.organisations.create({ 
            name: customValue.trim(),
            created_by: 'system'
          });
          newEntity = org;
          break;

        case 'collection':
          const { data: collection } = await adminService.collections.create({ 
            name: customValue.trim(),
            created_by: 'system'
          });
          newEntity = collection;
          break;

        default:
          throw new Error(`Entity type ${entityType} not supported`);
      }

      if (newEntity) {
        // Select the newly created entity
        onValueChange(newEntity.id);
        
        // Show success message
        Alert.alert('Success', `New ${entityType} created successfully`);
        
        // Close the modal
        closeModal();
      }
    } catch (error) {
      console.error(`Error creating new ${entityType}:`, error);
      Alert.alert('Error', `Failed to create new ${entityType}`);
    } finally {
      setIsSaving(false);
      setIsCreatingNew(false);
    }
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
        ) : selectedDisplay ? (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedText} numberOfLines={1}>
              {selectedDisplay}
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

            {/* Search or Create New Input */}
            <View style={styles.searchContainer}>
              {isCreatingNew ? (
                <View style={styles.createNewContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.createNewInput}
                    value={customValue}
                    onChangeText={setCustomValue}
                    placeholder={`Enter new ${entityType || 'item'} name`}
                    autoCapitalize="words"
                    onSubmitEditing={handleSaveNewOption}
                  />
                  <View style={styles.createNewButtons}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setIsCreatingNew(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.saveButton, !customValue.trim() && styles.saveButtonDisabled]}
                      onPress={handleSaveNewOption}
                      disabled={!customValue.trim() || isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={`Search or enter new ${entityType || 'item'}`}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {searchText ? (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>

            {/* Option List or Add New Button */}
            <ScrollView 
              style={styles.optionsContainer}
              keyboardShouldPersistTaps="handled"
            >
              {!isCreatingNew && isNewValue && allowNewValues && (
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={handleStartCreateNew}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
                  <Text style={styles.addNewText}>
                    Add "{searchText}" as new {entityType || 'item'}
                  </Text>
                </TouchableOpacity>
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
              ) : !isNewValue && !isCreatingNew ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching options found</Text>
                </View>
              ) : null}
            </ScrollView>
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
  optionsContainer: {
    maxHeight: 400,
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
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    borderStyle: 'dashed',
  },
  addNewText: {
    color: '#4f46e5',
    fontSize: 14,
    marginLeft: 8,
  },
  createNewContainer: {
    flex: 1,
  },
  createNewInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  createNewButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default ComboBoxInput;