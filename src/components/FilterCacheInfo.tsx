// src/components/FilterCacheInfo.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFilterCache from '@/hooks/useFilterCache';

// Define the cache keys to match those in FilterModal
const CACHE_KEYS = {
  COUNTRIES: 'countries',
  ORG_TYPES: 'organization_types',
  ORGANIZATIONS: 'organizations',
  INDUSTRY_TYPES: 'industry_types',
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

// Helper to format time duration
const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return 'Unknown';
  
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} days`;
};

const FilterCacheInfo: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use our custom hook to get cache status
  const {
    isCacheAvailable,
    cacheStatus,
    clearAllCaches,
    clearCache,
    refreshCacheStatus,
    isRefreshing
  } = useFilterCache(CACHE_KEYS);
  
  // Format cache sizes for display
  const formatCacheStatus = () => {
    // Map cache status to friendly names and values
    return Object.entries(cacheStatus).map(([key, status]) => ({
      name: key.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      ...status
    }));
  };
  
  // Calculate overall cache info
  const getCacheInfo = () => {
    const formattedStatus = formatCacheStatus();
    const cachedItems = formattedStatus.filter(item => item.exists).length;
    const totalItems = formattedStatus.length;
    
    // Find oldest and newest cache
    let oldestCache = { name: '', age: 0 };
    let newestCache = { name: '', age: Infinity };
    
    formattedStatus.forEach(item => {
      if (item.exists && item.age !== null) {
        if (item.age > (oldestCache.age || 0)) {
          oldestCache = { name: item.name, age: item.age };
        }
        if (item.age < (newestCache.age || Infinity)) {
          newestCache = { name: item.name, age: item.age };
        }
      }
    });
    
    return {
      cachedItems,
      totalItems,
      oldestCache: oldestCache.name ? `${oldestCache.name} (${formatDuration(oldestCache.age)})` : 'None',
      newestCache: newestCache.name ? `${newestCache.name} (${formatDuration(newestCache.age)})` : 'None'
    };
  };
  
  const cacheInfo = getCacheInfo();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name="server-outline"
          size={16}
          color="#4f46e5"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>
          Filter Cache Info {isCacheAvailable ? `(${cacheInfo.cachedItems}/${cacheInfo.totalItems})` : ''}
        </Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Cache Information</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollContainer}>
              {/* Cache summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Cache Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Status:</Text>
                  <Text 
                    style={[
                      styles.summaryValue, 
                      isCacheAvailable ? styles.cacheAvailable : styles.cacheUnavailable
                    ]}
                  >
                    {isCacheAvailable ? 'Available' : 'Not Available'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cached Items:</Text>
                  <Text style={styles.summaryValue}>
                    {cacheInfo.cachedItems} of {cacheInfo.totalItems}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Oldest Cache:</Text>
                  <Text style={styles.summaryValue}>{cacheInfo.oldestCache}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Newest Cache:</Text>
                  <Text style={styles.summaryValue}>{cacheInfo.newestCache}</Text>
                </View>
              </View>
              
              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={refreshCacheStatus}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <ActivityIndicator size="small" color="#4f46e5" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={18} color="#4f46e5" style={styles.actionIcon} />
                      <Text style={styles.refreshButtonText}>Refresh Status</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={clearAllCaches}
                  disabled={isRefreshing || !isCacheAvailable}
                >
                  <Ionicons name="trash" size={18} color="#fff" style={styles.actionIcon} />
                  <Text style={styles.clearAllButtonText}>Clear All Caches</Text>
                </TouchableOpacity>
              </View>
              
              {/* Cache Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Cache Details</Text>
                
                {formatCacheStatus().map((item, index) => (
                  <View key={index} style={styles.cacheItem}>
                    <View style={styles.cacheItemHeader}>
                      <Text style={styles.cacheItemName}>{item.name}</Text>
                      <View style={[
                        styles.cacheStatusBadge,
                        item.exists ? styles.cacheStatusPresent : styles.cacheStatusMissing
                      ]}>
                        <Text style={styles.cacheStatusText}>
                          {item.exists ? 'Cached' : 'Not Cached'}
                        </Text>
                      </View>
                    </View>
                    
                    {item.exists && (
                      <View style={styles.cacheItemDetails}>
                        <Text style={styles.cacheItemAge}>
                          Age: {formatDuration(item.age)}
                        </Text>
                        {item.lastUpdated && (
                          <Text style={styles.cacheItemTime}>
                            Last updated: {item.lastUpdated}
                          </Text>
                        )}
                        
                        <TouchableOpacity
                          style={styles.clearItemButton}
                          onPress={() => clearCache(key)}
                          disabled={isRefreshing}
                        >
                          <Ionicons name="close-circle" size={16} color="#ef4444" />
                          <Text style={styles.clearItemText}>Clear Cache</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignSelf: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
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
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  cacheAvailable: {
    color: '#10b981',
  },
  cacheUnavailable: {
    color: '#ef4444',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebe9fe',
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  refreshButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  clearAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  clearAllButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionIcon: {
    marginRight: 6,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cacheItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cacheItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cacheItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cacheStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  cacheStatusPresent: {
    backgroundColor: '#d1fae5',
  },
  cacheStatusMissing: {
    backgroundColor: '#fee2e2',
  },
  cacheStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cacheItemDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cacheItemAge: {
    fontSize: 13,
    color: '#4b5563',
  },
  cacheItemTime: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  clearItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  clearItemText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
});

export default FilterCacheInfo;