// src/components/FilterModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabaseClient } from '@/api/supabase/client';
import { useFilters } from '@/context/FilterContext';
import DateRangeFilter from './filters/DateRangeFilter';
import SelectInput from './filters/SelectInput';

// Define filter option type
interface FilterOption {
  id: string;
  name: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  resultCount?: number;
  hasMoreResults?: boolean;
}

const FilterModal = ({ 
  visible, 
  onClose,
  resultCount,
  hasMoreResults = false
}: FilterModalProps) => {
  // State for tabs
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabs = ['Common Filters', 'All Fields'];
  
  // Get filter context
  const {
    filters,
    setFilters,
    clearAllFilters,
    isLoading,
    refreshFilters,
    hasActiveFilters,
    filteredResults,
  } = useFilters();

  // States for filter options
  const [countryOptions, setCountryOptions] = useState<FilterOption[]>([]);
  const [orgTypeOptions, setOrgTypeOptions] = useState<FilterOption[]>([]);
  const [organisationOptions, setOrganisationOptions] = useState<FilterOption[]>([]);
  const [industryTypeOptions, setIndustryTypeOptions] = useState<FilterOption[]>([]);
  const [activeAreaOptions, setActiveAreaOptions] = useState<FilterOption[]>([]);
  const [routeOptions, setRouteOptions] = useState<FilterOption[]>([]);
  const [corporateBodyOptions, setCorporateBodyOptions] = useState<FilterOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<FilterOption[]>([]);
  const [facilityOptions, setFacilityOptions] = useState<FilterOption[]>([]);
  const [builderOptions, setBuilderOptions] = useState<FilterOption[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<FilterOption[]>([]);
  const [gaugeOptions, setGaugeOptions] = useState<FilterOption[]>([]);
  const [photographerOptions, setPhotographerOptions] = useState<FilterOption[]>([]);
  
  // States for local filter values (for fields with text input)
  const [description, setDescription] = useState<string>(filters.description || '');
  const [worksNumber, setWorksNumber] = useState<string>(filters.worksNumber || '');
  const [imageNo, setImageNo] = useState<string>(filters.imageNo || '');
  
  // State for loading options
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Effect to fetch filter options when modal is opened
  useEffect(() => {
    if (visible) {
      loadFilterOptions();
    }
  }, [visible]);
  
  // Function to load filter options from Supabase
  const loadFilterOptions = async () => {
    if (loadingOptions) return;
    
    try {
      setLoadingOptions(true);
      
      // Load countries
      const { data: countries } = await supabaseClient
        .from('country')
        .select('id, name')
        .order('name');
      
      if (countries) {
        setCountryOptions(countries.map(c => ({ id: c.id, name: c.name })));
      }
      
      // Load organisation types
      const { data: orgTypes } = await supabaseClient
        .from('organisation')
        .select('type')
        .not('type', 'is', null);
      
      if (orgTypes) {
        const uniqueTypes = Array.from(new Set(orgTypes.map(ot => ot.type).filter(Boolean)));
        setOrgTypeOptions(uniqueTypes.map(type => ({ id: type, name: type })));
      }
      
      // Load organisations
      const { data: organisations } = await supabaseClient
        .from('organisation')
        .select('id, name')
        .order('name')
        .limit(100);
      
      if (organisations) {
        setOrganisationOptions(organisations.map(o => ({ id: o.id, name: o.name || 'Unnamed' })));
      }
      
      // Get common industry types
      const { data: industries } = await supabaseClient
        .from('mobile_catalog_view')
        .select('type_of_industry')
        .not('type_of_industry', 'is', null);
      
      if (industries) {
        const uniqueIndustries = Array.from(new Set(industries
          .map(i => i.type_of_industry)
          .filter(Boolean)));
        setIndustryTypeOptions(uniqueIndustries.map(type => ({ id: type, name: type })));
      }
      
      // Get active areas
      const { data: areas } = await supabaseClient
        .from('mobile_catalog_view')
        .select('active_area')
        .not('active_area', 'is', null);
      
      if (areas) {
        const uniqueAreas = Array.from(new Set(areas
          .map(a => a.active_area)
          .filter(Boolean)));
        setActiveAreaOptions(uniqueAreas.map(area => ({ id: area, name: area })));
      }
      
      // Load routes
      const { data: routes } = await supabaseClient
        .from('route')
        .select('id, name')
        .order('name');
      
      if (routes) {
        setRouteOptions(routes.map(r => ({ id: r.id, name: r.name })));
      }
      
      // Get corporate bodies
      const { data: bodies } = await supabaseClient
        .from('mobile_catalog_view')
        .select('corporate_body')
        .not('corporate_body', 'is', null);
      
      if (bodies) {
        const uniqueBodies = Array.from(new Set(bodies
          .map(b => b.corporate_body)
          .filter(Boolean)));
        setCorporateBodyOptions(uniqueBodies.map(body => ({ id: body, name: body })));
      }
      
      // Load locations
      const { data: locations } = await supabaseClient
        .from('location')
        .select('id, name')
        .order('name')
        .limit(100);
      
      if (locations) {
        setLocationOptions(locations.map(l => ({ id: l.id, name: l.name })));
      }
      
      // Get facilities
      const { data: facilities } = await supabaseClient
        .from('mobile_catalog_view')
        .select('facility')
        .not('facility', 'is', null);
      
      if (facilities) {
        const uniqueFacilities = Array.from(new Set(facilities
          .map(f => f.facility)
          .filter(Boolean)));
        setFacilityOptions(uniqueFacilities.map(facility => ({ id: facility, name: facility })));
      }
      
      // Load builders
      const { data: builders } = await supabaseClient
        .from('builder')
        .select('id, name, code')
        .order('name');
      
      if (builders) {
        setBuilderOptions(builders.map(b => ({ 
          id: b.id, 
          name: b.name || b.code || 'Unnamed'
        })));
      }
      
      // Load collections
      const { data: collections } = await supabaseClient
        .from('collection')
        .select('id, name')
        .order('name');
      
      if (collections) {
        setCollectionOptions(collections.map(c => ({ id: c.id, name: c.name })));
      }
      
      // Get gauges
      const { data: gauges } = await supabaseClient
        .from('mobile_catalog_view')
        .select('gauge')
        .not('gauge', 'is', null);
      
      if (gauges) {
        const uniqueGauges = Array.from(new Set(gauges
          .map(g => g.gauge)
          .filter(Boolean)));
        setGaugeOptions(uniqueGauges.map(gauge => ({ id: gauge, name: gauge })));
      }
      
      // Load photographers
      const { data: photographers } = await supabaseClient
        .from('photographer')
        .select('id, name')
        .order('name');
      
      if (photographers) {
        setPhotographerOptions(photographers.map(p => ({ id: p.id, name: p.name })));
      }
      
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    // Update filters that use text inputs (for which we maintain local state)
    setFilters({
      ...filters,
      description,
      worksNumber,
      imageNo
    });
    
    // Refresh filters to trigger search
    refreshFilters().then(() => {
      // Close the modal after filters are applied
      onClose();
    });
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setDescription('');
    setWorksNumber('');
    setImageNo('');
    clearAllFilters();
  };

  // Get the real-time count from either filtered results or passed in resultCount
  const displayCount = filteredResults.length > 0 
    ? filteredResults.length 
    : resultCount || 0;

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
            <Text style={styles.modalTitle}>Photo Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTabIndex === index && styles.activeTab,
                ]}
                onPress={() => setActiveTabIndex(index)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTabIndex === index && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter content area */}
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {loadingOptions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading filter options...</Text>
              </View>
            ) : (
              <>
                {/* Common Filters Tab */}
                {activeTabIndex === 0 && (
                  <View style={styles.filterSection}>
                    {/* Common/Most Used Filters */}
                    
                    {/* Photographer Filter */}
                    <SelectInput
                      label="Photographer"
                      options={photographerOptions}
                      selectedValue={filters.photographer?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const photographer = photographerOptions.find(p => p.id === value);
                          if (photographer) {
                            setFilters({
                              ...filters,
                              photographer: { 
                                id: photographer.id, 
                                name: photographer.name 
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            photographer: null
                          });
                        }
                      }}
                      placeholder="Select photographer"
                    />
                    
                    {/* Location Filter */}
                    <SelectInput
                      label="Location"
                      options={locationOptions}
                      selectedValue={filters.location?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const location = locationOptions.find(l => l.id === value);
                          if (location) {
                            setFilters({
                              ...filters,
                              location: { 
                                id: location.id, 
                                name: location.name,
                                country: null
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            location: null
                          });
                        }
                      }}
                      placeholder="Select location"
                    />
                    
                    {/* Date Range Filter */}
                    <DateRangeFilter
                      label="Date Taken"
                      value={{
                        startDate: filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null,
                        endDate: filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null
                      }}
                      onChange={range => {
                        setFilters({
                          ...filters,
                          dateRange: {
                            startDate: range.startDate ? range.startDate.toISOString().split('T')[0] : null,
                            endDate: range.endDate ? range.endDate.toISOString().split('T')[0] : null
                          }
                        });
                      }}
                      placeholder="Filter by date range"
                    />
                    
                    {/* Gauge Filter */}
                    <SelectInput
                      label="Gauge"
                      options={gaugeOptions}
                      selectedValue={filters.gauge}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          gauge: value
                        });
                      }}
                      placeholder="Select gauge"
                    />
                    
                    {/* Description Filter */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description Keywords</Text>
                      <TextInput
                        style={styles.textInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Search in descriptions"
                      />
                    </View>

                    {/* Collection Filter */}
                    <SelectInput
                      label="Collection"
                      options={collectionOptions}
                      selectedValue={filters.collection?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const collection = collectionOptions.find(c => c.id === value);
                          if (collection) {
                            setFilters({
                              ...filters,
                              collection: { 
                                id: collection.id, 
                                name: collection.name,
                                owner: null
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            collection: null
                          });
                        }
                      }}
                      placeholder="Select collection"
                    />
                  </View>
                )}
                
                {/* All Fields Tab - Matching FileMaker Pro fields */}
                {activeTabIndex === 1 && (
                  <View style={styles.filterSection}>
                    {/* Country */}
                    <SelectInput
                      label="Country"
                      options={countryOptions}
                      selectedValue={filters.country}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          country: value
                        });
                      }}
                      placeholder="Select country"
                    />
                    
                    {/* Organisation Type */}
                    <SelectInput
                      label="Organisation Type"
                      options={orgTypeOptions}
                      selectedValue={filters.organisationType}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          organisationType: value
                        });
                      }}
                      placeholder="Select organisation type"
                    />
                    
                    {/* Organisation/Operator */}
                    <SelectInput
                      label="Organisation (Operator)"
                      options={organisationOptions}
                      selectedValue={filters.organisation?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const organisation = organisationOptions.find(o => o.id === value);
                          if (organisation) {
                            setFilters({
                              ...filters,
                              organisation: { 
                                id: organisation.id, 
                                name: organisation.name,
                                type: null
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            organisation: null
                          });
                        }
                      }}
                      placeholder="Select organisation"
                    />
                    
                    {/* Type of Industry */}
                    <SelectInput
                      label="Type of Industry"
                      options={industryTypeOptions}
                      selectedValue={filters.industryType}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          industryType: value
                        });
                      }}
                      placeholder="Select industry type"
                    />
                    
                    {/* Active Area */}
                    <SelectInput
                      label="Active Area"
                      options={activeAreaOptions}
                      selectedValue={filters.activeArea}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          activeArea: value
                        });
                      }}
                      placeholder="Select active area"
                    />
                    
                    {/* Route */}
                    <SelectInput
                      label="Route"
                      options={routeOptions}
                      selectedValue={filters.route}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          route: value
                        });
                      }}
                      placeholder="Select route"
                    />
                    
                    {/* Corporate Body */}
                    <SelectInput
                      label="Corporate Body"
                      options={corporateBodyOptions}
                      selectedValue={filters.corporateBody}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          corporateBody: value
                        });
                      }}
                      placeholder="Select corporate body"
                    />
                    
                    {/* Location (already in Basic Filters, duplicated here for completeness) */}
                    <SelectInput
                      label="Location"
                      options={locationOptions}
                      selectedValue={filters.location?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const location = locationOptions.find(l => l.id === value);
                          if (location) {
                            setFilters({
                              ...filters,
                              location: { 
                                id: location.id, 
                                name: location.name,
                                country: null
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            location: null
                          });
                        }
                      }}
                      placeholder="Select location"
                    />
                    
                    {/* Plant/Facility */}
                    <SelectInput
                      label="Plant/Facility"
                      options={facilityOptions}
                      selectedValue={filters.facility}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          facility: value
                        });
                      }}
                      placeholder="Select facility"
                    />
                    
                    {/* Description */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description</Text>
                      <TextInput
                        style={styles.textInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter description keywords"
                      />
                    </View>
                    
                    {/* Builder */}
                    <SelectInput
                      label="Builder"
                      options={builderOptions}
                      selectedValue={filters.builder}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          builder: value
                        });
                      }}
                      placeholder="Select builder"
                    />
                    
                    {/* Works Number */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Works Number</Text>
                      <TextInput
                        style={styles.textInput}
                        value={worksNumber}
                        onChangeText={setWorksNumber}
                        placeholder="Enter works number"
                      />
                    </View>
                    
                    {/* Collection */}
                    <SelectInput
                      label="Collection"
                      options={collectionOptions}
                      selectedValue={filters.collection?.id || null}
                      onValueChange={(value) => {
                        if (value) {
                          const collection = collectionOptions.find(c => c.id === value);
                          if (collection) {
                            setFilters({
                              ...filters,
                              collection: { 
                                id: collection.id, 
                                name: collection.name,
                                owner: null
                              }
                            });
                          }
                        } else {
                          setFilters({
                            ...filters,
                            collection: null
                          });
                        }
                      }}
                      placeholder="Select collection"
                    />
                    
                    {/* Image Number */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Image Number</Text>
                      <TextInput
                        style={styles.textInput}
                        value={imageNo}
                        onChangeText={setImageNo}
                        placeholder="Enter image number"
                      />
                    </View>
                    
                    {/* Gauge */}
                    <SelectInput
                      label="Gauge"
                      options={gaugeOptions}
                      selectedValue={filters.gauge}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          gauge: value
                        });
                      }}
                      placeholder="Select gauge"
                    />
                    
                    {/* Date Range - duplicated for completeness */}
                    <DateRangeFilter
                      label="Date Range"
                      value={{
                        startDate: filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null,
                        endDate: filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null
                      }}
                      onChange={range => {
                        setFilters({
                          ...filters,
                          dateRange: {
                            startDate: range.startDate ? range.startDate.toISOString().split('T')[0] : null,
                            endDate: range.endDate ? range.endDate.toISOString().split('T')[0] : null
                          }
                        });
                      }}
                      placeholder="Filter by date range"
                    />
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Real-time loading indicator */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Updating filters...</Text>
            </View>
          )}

          {/* Action buttons and result count */}
          <View style={styles.actionButtonsContainer}>
            {/* Result count display */}
            <Text style={styles.resultCountText}>
              {isLoading 
                ? "Calculating results..." 
                : `${displayCount} ${displayCount === 1 ? 'result' : 'results'} ${hasMoreResults ? '+' : ''}`}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '90%',
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  contentContainer: {
    maxHeight: '70%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  filterSection: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionButtonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultCountText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
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