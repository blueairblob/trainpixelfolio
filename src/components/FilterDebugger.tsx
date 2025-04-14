import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { supabaseClient } from '@/api/supabase/client';
import { useFilters } from '@/context/FilterContext';

/**
 * Debug component to help troubleshoot filtering issues
 * Add this to your GalleryScreen or anywhere you need to debug the filter behavior
 */
const FilterDebugger: React.FC = () => {
  const { filters, applyFilters, hasActiveFilters } = useFilters();
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to run a simplified test query
  const runTestQuery = async () => {
    if (!hasActiveFilters) {
      setRawResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('FilterDebugger: Running test query with filters', JSON.stringify(filters, null, 2));
      
      // Create a basic query 
      let query = supabaseClient
        .from('mobile_catalog_view')
        .select('image_no, description, organisation')
        .limit(10);
      
      // Apply specific filter for organization manually
      if (filters.organisation) {
        console.log(`FilterDebugger: Testing organization filter with "${filters.organisation.name}"`);
        
        // Try different filter approaches
        // 1. Simple equality (exact match)
        // query = query.eq('organisation', filters.organisation.name);
        
        // 2. Case-insensitive LIKE
        query = query.ilike('organisation', `%${filters.organisation.name}%`);
        
        // 3. Raw SQL (if Supabase supports it)
        // query = query.or(`organisation.ilike.%${filters.organisation.name}%`);
        
        console.log(`FilterDebugger: Applied filter`);
      }
      
      const { data, error: queryError } = await query;
      
      if (queryError) {
        console.error('FilterDebugger: Query error:', queryError);
        throw new Error(queryError.message);
      }
      
      console.log(`FilterDebugger: Query returned ${data?.length || 0} results`);
      if (data && data.length > 0) {
        console.log('FilterDebugger: First result sample:', data[0]);
      }
      
      setRawResults(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('FilterDebugger: Test query error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle expanded view
  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded && hasActiveFilters) {
      runTestQuery();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Filter Debugger</Text>
        <Text style={styles.toggleText}>
          {expanded ? 'Hide' : 'Show'} Details
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Filters:</Text>
            <Text style={styles.code}>
              {JSON.stringify(filters, null, 2)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={runTestQuery}
            disabled={isLoading || !hasActiveFilters}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Running Test Query...' : 'Run Test Query'}
            </Text>
          </TouchableOpacity>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Raw Results: {rawResults.length} item(s)
            </Text>
            {rawResults.length > 0 ? (
              <Text style={styles.code}>
                {JSON.stringify(rawResults.slice(0, 3), null, 2)}
                {rawResults.length > 3 && '\n... (and more)'}
              </Text>
            ) : (
              <Text style={styles.emptyText}>
                {hasActiveFilters 
                  ? 'No results found for current filters' 
                  : 'No active filters to test'}
              </Text>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting Tips:</Text>
            <Text style={styles.tipText}>
              • Check if your organization name matches exactly what's in the database
            </Text>
            <Text style={styles.tipText}>
              • Try using partial matching with % wildcards (ilike)
            </Text>
            <Text style={styles.tipText}>
              • Verify column names match exactly what's in the database
            </Text>
            <Text style={styles.tipText}>
              • Check that you're querying the correct table/view
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  toggleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    padding: 12,
    maxHeight: 400,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default FilterDebugger;