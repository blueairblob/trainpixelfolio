// src/components/HeaderSection.tsx - Updated with feature flags
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { canShowCart } from '@/config/features';

interface HeaderSectionProps {
  onCartPress: () => void;
}

const HeaderSection = ({ onCartPress }: HeaderSectionProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Pica Loco</Text>
      
      {/* Conditionally show cart icon */}
      {canShowCart() && (
        <TouchableOpacity onPress={onCartPress}>
          <Ionicons name="cart" size={24} color="#4f46e5" />
        </TouchableOpacity>
      )}
      
      {/* Show placeholder for spacing if cart is hidden */}
      {!canShowCart() && <View style={styles.spacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  spacer: {
    width: 24,
    height: 24,
  },
});

export default HeaderSection;