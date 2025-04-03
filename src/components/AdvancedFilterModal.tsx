import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFilters } from '@/context/FilterContext';
import OrganisationFilter from './filters/OrganisationFilter';
import DateRangeFilter from './filters/DateRangeFilter';

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: () => void;
  resultCount?: number;
  hasMoreResults?: boolean;
}

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  resultCount,
  hasMoreResults = false,
}) => {
  const {
    filters,
    setOrganisation,
    setDateRange, // Add this line
    clearAllFilters,
    isLoading,
    filteredResults,
    hasActiveFilters,
  } = useFilters();

  // Active filter count in this modal for badge display
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabs = ['Basic Filters', 'Advanced Filters'];

  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilters();
    onClose();
  };

  // Handle reset filters
  const handleResetFilters = () => {
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
            <Text style={styles.modalTitle}>Filters</Text>
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
          <View style={styles.contentContainer}>
            {activeTabIndex === 0 ? (
              <View style={styles.filterSection}>
                {/* Organisation Filter */}
                <OrganisationFilter
                  onSelect={setOrganisation}
                  selectedOrganisation={filters.organisation}
                  label="Organisation"
                />

                {/* Date Range Filter */}
                <DateRangeFilter
                  label="Date Taken"
                  value={{
                    startDate: filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null,
                    endDate: filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null
                  }}
                  onChange={range => {
                    setDateRange({
                      startDate: range.startDate ? range.startDate.toISOString().split('T')[0] : null,
                      endDate: range.endDate ? range.endDate.toISOString().split('T')[0] : null
                    });
                  }}
                  placeholder="Filter by date range"
                />
                
                {/* Placeholder for future basic filters */}
                <View style={styles.comingSoonContainer}>
                  <Text style={styles.comingSoonText}>
                    More filters coming soon...
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.filterSection}>
                {/* Placeholder for advanced filters */}
                <View style={styles.comingSoonContainer}>
                  <Text style={styles.comingSoonText}>
                    Advanced filters coming soon...
                  </Text>
                  <Text style={styles.comingSoonSubtext}>
                    These will include technical specifications, metadata filters, 
                    and more detailed search options.
                  </Text>
                </View>
              </View>
            )}
          </View>

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
  scrollView: {
    maxHeight: '70%',
    flex: 1,
  },
  filterSection: {
    padding: 16,
  },
  comingSoonContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4b5563',
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
  contentContainer: {
    maxHeight: '70%',
  },
});

export default AdvancedFilterModal;