// YearMonthDayPicker.tsx
// - A more flexible date range component for historical photos
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectInput from './SelectInput'; // Reuse your existing component

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface YearMonthDayPickerProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  startYear?: number; // Allow setting the earliest year (e.g., 1850)
  endYear?: number;   // Allow setting the latest year (current year by default)
}

const YearMonthDayPicker: React.FC<YearMonthDayPickerProps> = ({
  label = 'Date Range',
  value,
  onChange,
  placeholder = 'Select date range',
  startYear = 1850, // Early enough for vintage train photos
  endYear = new Date().getFullYear()
}) => {
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  
  // Local state for selected values
  const [startYearSelected, setStartYearSelected] = useState<number | null>(
    value.startDate ? value.startDate.getFullYear() : null
  );
  const [startMonthSelected, setStartMonthSelected] = useState<number | null>(
    value.startDate ? value.startDate.getMonth() : null
  );
  const [startDaySelected, setStartDaySelected] = useState<number | null>(
    value.startDate ? value.startDate.getDate() : null
  );
  
  const [endYearSelected, setEndYearSelected] = useState<number | null>(
    value.endDate ? value.endDate.getFullYear() : null
  );
  const [endMonthSelected, setEndMonthSelected] = useState<number | null>(
    value.endDate ? value.endDate.getMonth() : null
  );
  const [endDaySelected, setEndDaySelected] = useState<number | null>(
    value.endDate ? value.endDate.getDate() : null
  );
  
  // Generate year options
  const yearOptions = Array.from(
    { length: endYear - startYear + 1 }, 
    (_, i) => ({ id: (startYear + i).toString(), name: (startYear + i).toString() })
  ).reverse(); // Most recent years first
  
  // Generate month options
  const monthOptions = [
    { id: '0', name: 'January' },
    { id: '1', name: 'February' },
    { id: '2', name: 'March' },
    { id: '3', name: 'April' },
    { id: '4', name: 'May' },
    { id: '5', name: 'June' },
    { id: '6', name: 'July' },
    { id: '7', name: 'August' },
    { id: '8', name: 'September' },
    { id: '9', name: 'October' },
    { id: '10', name: 'November' },
    { id: '11', name: 'December' }
  ];
  
  // Generate day options (based on month and year)
  const getDaysInMonth = (year: number | null, month: number | null) => {
    if (year === null || month === null) return 31;
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getDayOptions = (year: number | null, month: number | null) => {
    const daysInMonth = getDaysInMonth(year, month);
    return Array.from(
      { length: daysInMonth }, 
      (_, i) => ({ id: (i + 1).toString(), name: (i + 1).toString() })
    );
  };
  
  // Apply selected date
  const applyStartDate = () => {
    if (startYearSelected) {
      const newStartDate = new Date(
        startYearSelected,
        startMonthSelected || 0,
        startDaySelected || 1
      );
      
      onChange({
        startDate: newStartDate,
        endDate: value.endDate
      });
    }
    
    setIsStartDateModalOpen(false);
  };
  
  const applyEndDate = () => {
    if (endYearSelected) {
      const newEndDate = new Date(
        endYearSelected,
        endMonthSelected !== null ? endMonthSelected : 11,
        endDaySelected !== null ? endDaySelected : getDaysInMonth(endYearSelected, endMonthSelected !== null ? endMonthSelected : 11)
      );
      
      onChange({
        startDate: value.startDate,
        endDate: newEndDate
      });
    }
    
    setIsEndDateModalOpen(false);
  };
  
  // Clear the entire date range
  const clearDateRange = () => {
    onChange({ startDate: null, endDate: null });
    setStartYearSelected(null);
    setStartMonthSelected(null);
    setStartDaySelected(null);
    setEndYearSelected(null);
    setEndMonthSelected(null);
    setEndDaySelected(null);
  };
  
  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.dateRangeContainer}>
        {/* Start Date Button */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setIsStartDateModalOpen(true)}
        >
          <Text style={value.startDate ? styles.dateButtonTextSelected : styles.dateButtonText}>
            {value.startDate ? formatDate(value.startDate) : 'Start Date'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.dateRangeSeparator}>to</Text>
        
        {/* End Date Button */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setIsEndDateModalOpen(true)}
        >
          <Text style={value.endDate ? styles.dateButtonTextSelected : styles.dateButtonText}>
            {value.endDate ? formatDate(value.endDate) : 'End Date'}
          </Text>
        </TouchableOpacity>
        
        {/* Clear Button */}
        {(value.startDate || value.endDate) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearDateRange}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Start Date Modal */}
      <Modal
        visible={isStartDateModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsStartDateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity onPress={() => setIsStartDateModalOpen(false)}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <SelectInput
                  label="Year"
                  options={yearOptions}
                  selectedValue={startYearSelected?.toString() || null}
                  onValueChange={(value) => setStartYearSelected(value ? parseInt(value) : null)}
                  placeholder="Select year"
                />
              </View>
              
              <View style={styles.modalSection}>
                <SelectInput
                  label="Month"
                  options={monthOptions}
                  selectedValue={startMonthSelected?.toString() || null}
                  onValueChange={(value) => setStartMonthSelected(value ? parseInt(value) : null)}
                  placeholder="Select month"
                  disabled={!startYearSelected}
                />
              </View>
              
              <View style={styles.modalSection}>
                <SelectInput
                  label="Day"
                  options={getDayOptions(startYearSelected, startMonthSelected)}
                  selectedValue={startDaySelected?.toString() || null}
                  onValueChange={(value) => setStartDaySelected(value ? parseInt(value) : null)}
                  placeholder="Select day"
                  disabled={startMonthSelected === null}
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsStartDateModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.applyButton, !startYearSelected && styles.disabledButton]}
                onPress={applyStartDate}
                disabled={!startYearSelected}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* End Date Modal - Similar structure as Start Date Modal */}
      <Modal
        visible={isEndDateModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEndDateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select End Date</Text>
              <TouchableOpacity onPress={() => setIsEndDateModalOpen(false)}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            {/* Similar content as Start Date Modal */}
            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <SelectInput
                  label="Year"
                  options={yearOptions}
                  selectedValue={endYearSelected?.toString() || null}
                  onValueChange={(value) => setEndYearSelected(value ? parseInt(value) : null)}
                  placeholder="Select year"
                />
              </View>
              
              <View style={styles.modalSection}>
                <SelectInput
                  label="Month"
                  options={monthOptions}
                  selectedValue={endMonthSelected?.toString() || null}
                  onValueChange={(value) => setEndMonthSelected(value ? parseInt(value) : null)}
                  placeholder="Select month"
                  disabled={!endYearSelected}
                />
              </View>
              
              <View style={styles.modalSection}>
                <SelectInput
                  label="Day"
                  options={getDayOptions(endYearSelected, endMonthSelected)}
                  selectedValue={endDaySelected?.toString() || null}
                  onValueChange={(value) => setEndDaySelected(value ? parseInt(value) : null)}
                  placeholder="Select day"
                  disabled={endMonthSelected === null}
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsEndDateModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.applyButton, !endYearSelected && styles.disabledButton]}
                onPress={applyEndDate}
                disabled={!endYearSelected}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dateButtonTextSelected: {
    color: '#1f2937',
  },
  dateRangeSeparator: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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
  modalContent: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default YearMonthDayPicker;