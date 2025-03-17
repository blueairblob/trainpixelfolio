
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderSectionProps {
  onCartPress: () => void;
}

const HeaderSection = ({ onCartPress }: HeaderSectionProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>TrainPhoto</Text>
      <TouchableOpacity onPress={onCartPress}>
        <Ionicons name="cart" size={24} color="#4f46e5" />
      </TouchableOpacity>
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
});

export default HeaderSection;
