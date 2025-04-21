// src/components/FilterModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { useFilters, Country, OrganisationType, Organisation, Location, Collection, Photographer, Gauge } from '@/context/FilterContext';
import DateRangeFilter from './filters/DateRangeFilter';
import SelectInput from './filters/SelectInput';
import { getCachedFilterOptions, cacheFilterOptions } from '@/utils/filterCache';
import { filterService } from '@/api/supabase';

// Cache keys - consistent with FilterCacheInfo
const CACHE_KEYS = {
  COUNTRIES: 'countries',
  ORG_TYPES: 'organisation_types',
  ORGANISATIONS: 'organisations',
  ACTIVE_AREAS: 'active_areas',
  ROUTES: 'routes',
  CORPORATE_BODIES: 'corporate_bodies',
  LOCATIONS: 'locations',
  FACILITIES: 'facilities',
  BUILDERS: 'builders',
  COLLECTIONS: 'collections',
  GAUGES: 'gauges',
  PHOTOGRAPHERS: 'photographers'
};

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
  // Get filter context
  const {
    filters,
    setFilters,
    clearAllFilters,
    isLoading,
    applyFilters,
    refreshFilters,
    hasActiveFilters,
    filteredResults,
  } = useFilters();

  // States for filter options
  const [countryOptions, setCountryOptions] = useState<FilterOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [orgTypeOptions, setOrgTypeOptions] = useState<FilterOption[]>([]);
  const [organisationOptions, setOrganisationOptions] = useState<FilterOption[]>([]);
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
  
  // State for loading options and counts
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({});
  const [countLoading, setCountLoading] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  
  // Track if filters have changed
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [initialFilters, setInitialFilters] = useState(filters);

  // Effect to fetch filter options when modal is opened
  useEffect(() => {
    if (visible) {
      loadFilterOptions();
      // Initialize with the result count
      setEstimatedCount(resultCount || 0);
      // Track initial filters for comparison
      setInitialFilters({...filters});
      // Reset filtersChanged flag when opening modal
      setFiltersChanged(false);
    }
  }, [visible]);
  
  // Effect to estimate the result count as filters change
  useEffect(() => {
    if (!visible) return;
    
    // Need to debounce this to prevent too many queries
    const timer = setTimeout(() => {
      try {
        getFilteredCount();
        
        // Check if filters have changed from initial state
        const hasChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
        setFiltersChanged(hasChanged);
      } catch (e) {
        console.log('Count estimation error, using fallback:', e);
        // If count estimation fails, use a fallback display
        setCountLoading(false);
        // Don't update count, let the UI show "Applying filters..." instead
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters]);

  // Function to get estimated count when applying the current filters
  const getFilteredCount = async () => {
    // Skip if no active filters
    if (!hasActiveFilters) {
      setEstimatedCount(resultCount || 0);
      return;
    }
    
    setCountLoading(true);
    
    try {
      console.log('Building count query...');
      
      // Start with a base query - use a simpler query just for count
      // Instead of using head: true which might be causing issues
      let query = supabaseClient
        .from('mobile_catalog_view')
        .select('image_no', { count: 'exact' });
      
      // Apply all the filters
      console.log('Applying filters to count query...');
      query = applyFilters(query);
      
      console.log('Executing count query...');
      const { count, error, status } = await query;
      
      console.log('Count query complete, status:', status);
      
      if (error) {
        console.error('Count query error:', error);
        throw error;
      }
      
      console.log('Count result:', count);
      setEstimatedCount(count || 0);
    } catch (error) {
      console.error('Error getting filtered count:', error);
      // Don't update the count if there's an error, keep the previous value
      // Just log the error and continue
    } finally {
      setCountLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    if (loadingOptions) return;
    
    try {
      setLoadingOptions(true);
      
      // Load option data using filterService
      const { data: country } = await filterService.getCountries();
      if (country) setCountryOptions(country);

      const { data: categories } = await filterService.getCategories();
      if (categories) setCategoryOptions(categories);
      
      const { data: photographers } = await filterService.getPhotographers();
      if (photographers) setPhotographerOptions(photographers);
      
      const { data: locations } = await filterService.getLocations();
      if (locations) setLocationOptions(locations);
      
      const { data: orgType } = await filterService.getOrganisationTypes();
      if (orgType) setOrgTypeOptions(orgType);

      const { data: organisations } = await filterService.getOrganisations();
      if (organisations) setOrganisationOptions(organisations);
    
      const { data: activeArea } = await filterService.getActiveAreas();
      if (activeArea) setActiveAreaOptions(activeArea);

      const { data: routes } = await filterService.getRoutes();
      if (routes) setRouteOptions(routes);

      const { data: corporateBodies } = await filterService.getCorporateBodies();
      if (corporateBodies) setCorporateBodyOptions(corporateBodies);

      const { data: facilities } = await filterService.getFacilities();
      if (facilities) setFacilityOptions(facilities);

      const { data: builders } = await filterService.getBuilders();
      if (builders) setBuilderOptions(builders);

      const { data: collection } = await filterService.getCollections();
      if (collection) setCollectionOptions(collection);

      const { data: gauges } = await filterService.getGauges();
      if (gauges) setGaugeOptions(gauges);
      
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
    setEstimatedCount(resultCount || 0);
    setFiltersChanged(false);
    setInitialFilters({}); // Reset the initial filters to empty
  };

  // Get the real-time count from estimatedCount, filtered results, or passed in resultCount
  const displayCount = estimatedCount !== null 
    ? estimatedCount
    : filteredResults.length > 0 
      ? filteredResults.length 
      : resultCount || 0;

  // Format the display count with proper message
  const getDisplayCountText = () => {
    if (isLoading || countLoading) {
      return "Calculating results...";
    }
    
    if (estimatedCount === 0 && hasActiveFilters) {
      return "No matching results";
    }
    
    if (estimatedCount === null) {
      return "Applying filters..."; // Fallback when count estimation fails
    }
    
    return `${displayCount} ${displayCount === 1 ? 'result' : 'results'} ${hasMoreResults ? '+' : ''}`;
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
            <Text style={styles.modalTitle}>Photo Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
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
              <View style={styles.filterSection}>
                {/* Country */}
                <SelectInput
                  label="Country"
                  options={countryOptions}
                  selectedValue={filters.country?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const country = countryOptions.find(c => c.id === value);
                      if (country) {
                        setFilters({
                          ...filters,
                          country: { 
                            id: country.id, 
                            name: country.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        country: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select country"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.COUNTRIES]}
                />
                
                {/* Organisation Type */}
                <SelectInput
                  label="Organisation Type"
                  options={orgTypeOptions}
                  selectedValue={filters.organisationType?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const orgType = orgTypeOptions.find(ot => ot.id === value);
                      if (orgType) {
                        setFilters({
                          ...filters,
                          organisationType: { 
                            id: orgType.id, 
                            name: orgType.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        organisationType: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select organisation type"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.ORG_TYPES]}
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
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        organisation: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select organisation"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.ORGANISATIONS]}
                />
                
                {/* Active Area */}
                <SelectInput
                  label="Active Area"
                  options={activeAreaOptions}
                  selectedValue={filters.activeArea?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const activeArea = activeAreaOptions.find(aa => aa.id === value);
                      if (activeArea) {
                        setFilters({
                          ...filters,
                          activeArea: { 
                            id: activeArea.id, 
                            name: activeArea.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        activeArea: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select active area"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.ACTIVE_AREAS]}
                />
                
                {/* Route */}
                <SelectInput
                  label="Route"
                  options={routeOptions}
                  selectedValue={filters.route?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const route = routeOptions.find(r => r.id === value);
                      if (route) {
                        setFilters({
                          ...filters,
                          route: { 
                            id: route.id, 
                            name: route.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        route: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select route"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.ROUTES]}
                />
                
                {/* Corporate Body */}
                <SelectInput
                  label="Corporate Body"
                  options={corporateBodyOptions}
                  selectedValue={filters.corporateBody?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const corporateBody = corporateBodyOptions.find(cb => cb.id === value);
                      if (corporateBody) {
                        setFilters({
                          ...filters,
                          corporateBody: { 
                            id: corporateBody.id, 
                            name: corporateBody.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        corporateBody: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select corporate body"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.CORPORATE_BODIES]}
                />
                
                {/* Location */}
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
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        location: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select location"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.LOCATIONS]}
                />
                
                {/* Plant/Facility */}
                <SelectInput
                  label="Plant/Facility"
                  options={facilityOptions}
                  selectedValue={filters.facility?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const facility = facilityOptions.find(f => f.id === value);
                      if (facility) {
                        setFilters({
                          ...filters,
                          facility: { 
                            id: facility.id, 
                            name: facility.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        facility: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select facility"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.FACILITIES]}
                />
                
                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.textInput}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      setFiltersChanged(true);
                    }}
                    placeholder="Enter description keywords"
                  />
                </View>
                
                {/* Builder */}
                <SelectInput
                  label="Builder"
                  options={builderOptions}
                  selectedValue={filters.builder?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const builder = builderOptions.find(b => b.id === value);
                      if (builder) {
                        setFilters({
                          ...filters,
                          builder: { 
                            id: builder.id, 
                            name: builder.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        builder: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select builder"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.BUILDERS]}
                />
                
                {/* Works Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Works Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={worksNumber}
                    onChangeText={(text) => {
                      setWorksNumber(text);
                      setFiltersChanged(true);
                    }}
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
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        collection: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select collection"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.COLLECTIONS]}
                />
                
                {/* Image Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Image Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={imageNo}
                    onChangeText={(text) => {
                      setImageNo(text);
                      setFiltersChanged(true);
                    }}
                    placeholder="Enter image number"
                  />
                </View>
                
                {/* Gauge */}
                <SelectInput
                  label="Gauge"
                  options={gaugeOptions}
                  selectedValue={filters.gauge?.id || null}
                  onValueChange={(value) => {
                    if (value) {
                      const gauge = gaugeOptions.find(g => g.id === value);
                      if (gauge) {
                        setFilters({
                          ...filters,
                          gauge: { 
                            id: gauge.id, 
                            name: gauge.name 
                          }
                        });
                        setFiltersChanged(true);
                      }
                    } else {
                      setFilters({
                        ...filters,
                        gauge: null
                      });
                      setFiltersChanged(true);
                    }
                  }}
                  placeholder="Select gauge"
                  loading={loadingOptions && !cacheStatus[CACHE_KEYS.GAUGES]}
                />
                
                {/* Date Range */}
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
                    setFiltersChanged(true);
                  }}
                  placeholder="Filter by date range"
                />
              </View>
            )}
          </ScrollView>

          {/* Real-time loading indicator */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Updating filters...</Text>
            </View>
          )}

          {/* Action buttons and query count */}
          <View style={styles.actionButtonsContainer}>
            {/* Query count display */}
            <View style={styles.resultCountWrapper}>
              {countLoading && <ActivityIndicator size="small" color="#4f46e5" style={styles.countLoadingIndicator} />}
              <Text style={[
                styles.resultCountText,
                displayCount === 0 && hasActiveFilters && styles.noResultsText
              ]}>
                {getDisplayCountText()}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.resetButton, !filtersChanged && styles.buttonDisabled]}
                onPress={handleResetFilters}
                disabled={!filtersChanged}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (!filtersChanged || (displayCount === 0 && hasActiveFilters)) && styles.buttonDisabled
                ]}
                onPress={handleApplyFilters}
                disabled={!filtersChanged || (displayCount === 0 && hasActiveFilters)}
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
  resultCountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  countLoadingIndicator: {
    marginRight: 8,
  },
  resultCountText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  noResultsText: {
    color: '#ef4444',
    fontWeight: '500',
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
  applyButtonWarning: {
    backgroundColor: '#f59e0b', // Use a warning color when there are no results
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default FilterModal;