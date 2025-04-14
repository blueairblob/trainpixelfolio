import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabaseClient } from '@/api/supabase/client';
import { useDebounce } from '../../hooks/useDebounce';

interface Organisation {
  id: string;
  name: string;
  type: string | null;
}

interface OrganisationFilterProps {
  onSelect: (organisation: Organisation | null) => void;
  selectedOrganisation: Organisation | null;
  label?: string;
}

const OrganisationFilter: React.FC<OrganisationFilterProps> = ({
  onSelect,
  selectedOrganisation,
  label = 'Organisation',
}) => {
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organisationTypes, setOrganisationTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(searchText, 300);

  // Fetch organisation types
  useEffect(() => {
    const fetchOrganisationTypes = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('organisation')
          .select('type')
          .not('type', 'is', null);

        if (error) throw error;

        // Extract unique types
        const types = Array.from(
          new Set(data.map((item) => item.type).filter(Boolean))
        ).sort() as string[];

        setOrganisationTypes(types);
      } catch (err) {
        console.error('Error fetching organisation types:', err);
        setError('Failed to load organisation types');
      }
    };

    fetchOrganisationTypes();
  }, []);

  // Fetch organisations based on search and type filter
  const fetchOrganisations = useCallback(async () => {
    if (!isDropdownOpen) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabaseClient
        .from('organisation')
        .select('id, name, type')
        .order('name');

      // Apply search filter if text is provided
      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      // Apply type filter if selected
      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      // Limit results for performance
      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;

      setOrganisations(data || []);
    } catch (err) {
      console.error('Error fetching organisations:', err);
      setError('Failed to load organisations');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedType, isDropdownOpen]);

  // Fetch organisations when search or type changes
  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  // Handle organisation selection
  const handleSelectOrganisation = (organisation: Organisation) => {
    onSelect(organisation);
    setIsDropdownOpen(false);
    setSearchText('');
  };

  // Clear selection
  const handleClear = () => {
    onSelect(null);
    setSearchText('');
    setSelectedType(null);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      // Reset search when opening
      setSearchText('');
    }
  };

  // Toggle organisation type filter
  const handleSelectType = (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Selected organisation display or dropdown trigger */}
      <TouchableOpacity 
        style={styles.selectionContainer} 
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        {selectedOrganisation ? (
          <View style={styles.selectedOrganisation}>
            <Text style={styles.selectedName}>{selectedOrganisation.name}</Text>
            {selectedOrganisation.type && (
              <Text style={styles.selectedType}>{selectedOrganisation.type}</Text>
            )}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select an organisation</Text>
            <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#6b7280" />
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown content */}
      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {/* Search input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search organisations..."
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Organisation types filter */}
          {organisationTypes.length > 0 && (
            <View style={styles.typeFiltersContainer}>
              <Text style={styles.typeFiltersTitle}>Filter by type:</Text>
              <View style={styles.typeFiltersScrollContainer}>
                {/* Use FlatList instead of ScrollView for type filters */}
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={organisationTypes}
                  keyExtractor={(item) => item}
                  renderItem={({ item: type }) => (
                    <TouchableOpacity
                      style={[
                        styles.typeFilterChip,
                        selectedType === type && styles.selectedTypeFilterChip,
                      ]}
                      onPress={() => handleSelectType(type)}
                    >
                      <Text
                        style={[
                          styles.typeFilterText,
                          selectedType === type && styles.selectedTypeFilterText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.typeFilters}
                />
              </View>
            </View>
          )}

          {/* Results container */}
          <View style={styles.resultsContainer}>
            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading organisations...</Text>
              </View>
            )}

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Results list */}
            {!isLoading && !error && (
              <>
                {organisations.length > 0 ? (
                  <FlatList
                    data={organisations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.organisationItem}
                        onPress={() => handleSelectOrganisation(item)}
                      >
                        <Text style={styles.organisationName}>{item.name}</Text>
                        {item.type && (
                          <Text style={styles.organisationType}>{item.type}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    style={styles.organisationList}
                    contentContainerStyle={styles.organisationListContent}
                    maxToRenderPerBatch={10}
                    initialNumToRender={10}
                    windowSize={5}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No organisations found</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      )}
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
  selectionContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  selectedOrganisation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedName: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
  },
  selectedType: {
    fontSize: 13,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  clearButton: {
    padding: 2,
  },
  placeholderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 6,
  },
  typeFiltersContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  typeFiltersTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  typeFiltersScrollContainer: {
    flexDirection: 'row',
  },
  typeFilters: {
    paddingBottom: 4,
  },
  typeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTypeFilterChip: {
    backgroundColor: '#4f46e5',
  },
  typeFilterText: {
    fontSize: 13,
    color: '#4b5563',
  },
  selectedTypeFilterText: {
    color: '#ffffff',
  },
  resultsContainer: {
    maxHeight: 250,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  organisationList: {
    maxHeight: 216,
  },
  organisationListContent: {
    paddingHorizontal: 12,
  },
  organisationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organisationName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  organisationType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default OrganisationFilter;