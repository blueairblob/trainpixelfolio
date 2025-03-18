
import React from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mobile-friendly command component alternative to cmdk
export const Command = ({ children, style, ...props }) => {
  return (
    <View style={[styles.commandContainer, style]} {...props}>
      {children}
    </View>
  );
};

export const CommandInput = ({ placeholder, value, onChangeText, style, ...props }) => {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
};

export const CommandList = ({ data, renderItem, style, ...props }) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      style={[styles.list, style]}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
};

export const CommandEmpty = ({ children, style, ...props }) => {
  return (
    <View style={[styles.empty, style]} {...props}>
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  );
};

export const CommandGroup = ({ title, children, style, ...props }) => {
  return (
    <View style={[styles.group, style]} {...props}>
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      {children}
    </View>
  );
};

export const CommandItem = ({ children, onPress, style, ...props }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]} {...props}>
      {typeof children === 'string' ? <Text style={styles.itemText}>{children}</Text> : children}
    </TouchableOpacity>
  );
};

export const CommandSeparator = ({ style, ...props }) => {
  return <View style={[styles.separator, style]} {...props} />;
};

const styles = StyleSheet.create({
  commandContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1f2937',
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  group: {
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#1f2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
});
