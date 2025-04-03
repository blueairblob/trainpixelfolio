import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangeFilterProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  label = 'Date Range',
  value,
  onChange,
  placeholder = 'Select date range',
}) => {
  const [mode, setMode] = useState<'start' | 'end' | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get display text
  const getDisplayText = (): string => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} to ${formatDate(value.endDate)}`;
    } 
    
    if (value.startDate) {
      return `From ${formatDate(value.startDate)}`;
    }
    
    if (value.endDate) {
      return `Until ${formatDate(value.endDate)}`;
    }
    
    return placeholder;
  };

  // Open date picker for start or end date
  const openPicker = (type: 'start' | 'end') => {
    setMode(type);
    setTempDate(
      type === 'start' ? value.startDate || new Date() : value.endDate || new Date()
    );
    setShowPicker(true);
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setTempDate(selectedDate);
      
      if (Platform.OS !== 'ios') {
        // On Android, we immediately apply the date when selected
        const newRange = { ...value };
        if (mode === 'start') {
          newRange.startDate = selectedDate;
        } else {
          newRange.endDate = selectedDate;
        }
        onChange(newRange);
      }
    }
  };

  // Clear date range
  const clearDateRange = () => {
    onChange({ startDate: null, endDate: null });
  };

  // Confirm iOS picker
  const confirmIOSPicker = () => {
    if (tempDate) {
      const newRange = { ...value };
      if (mode === 'start') {
        newRange.startDate = tempDate;
      } else {
        newRange.endDate = tempDate;
      }
      onChange(newRange);
    }
    setShowPicker(false);
  };

  // Cancel iOS picker
  const cancelIOSPicker = () => {
    setShowPicker(false);
  };

  // Render iOS picker modal
  const renderIOSPicker = () => (
    <Modal
      transparent={true}
      visible={showPicker && Platform.OS === 'ios'}
      animationType="slide"
    >
      <View style={styles.iosPickerContainer}>
        <View style={styles.iosPickerContent}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={cancelIOSPicker}>
              <Text style={styles.iosPickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.iosPickerTitle}>
              Select {mode === 'start' ? 'Start' : 'End'} Date
            </Text>
            <TouchableOpacity onPress={confirmIOSPicker}>
              <Text style={styles.iosPickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={styles.iosPicker}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openPicker('start')}
        >
          <Text
            style={[
              styles.dateButtonText,
              value.startDate ? styles.dateButtonTextSelected : {},
            ]}
          >
            {value.startDate ? formatDate(value.startDate) : 'Start Date'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateRangeSeparator}>to</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openPicker('end')}
        >
          <Text
            style={[
              styles.dateButtonText,
              value.endDate ? styles.dateButtonTextSelected : {},
            ]}
          >
            {value.endDate ? formatDate(value.endDate) : 'End Date'}
          </Text>
        </TouchableOpacity>

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

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'ios' && renderIOSPicker()}
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
  // iOS specific styles
  iosPickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iosPickerContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  iosPickerCancelText: {
    fontSize: 15,
    color: '#6b7280',
  },
  iosPickerDoneText: {
    fontSize: 15,
    color: '#4f46e5',
    fontWeight: '600',
  },
  iosPicker: {
    height: 216,
  },
});

export default DateRangeFilter;