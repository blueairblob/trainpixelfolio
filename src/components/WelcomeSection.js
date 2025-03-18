
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WelcomeSection = ({ onBrowsePress }) => {
  return (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>Premium Train Photography</Text>
      <Text style={styles.welcomeText}>
        Discover our collection of high-quality train photographs from around the world
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={onBrowsePress}
      >
        <Text style={styles.browseButtonText}>Browse Gallery</Text>
        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    backgroundColor: '#4f46e5',
    padding: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#ebebff',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  browseButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default WelcomeSection;
