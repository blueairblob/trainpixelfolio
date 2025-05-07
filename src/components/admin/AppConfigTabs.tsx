// src/components/admin/AppConfigTabs.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppConfigForm from './AppConfigForm';
import AdminFavoritesSettings from './AdminFavoritesSettings';

interface AppConfigTabsProps {
  appConfig: any;
  setAppConfig: (config: any) => void;
  saveAppConfig: () => Promise<void>;
  isLoading: boolean;
}

const AppConfigTabs: React.FC<AppConfigTabsProps> = ({
  appConfig,
  setAppConfig,
  saveAppConfig,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', title: 'App Configuration', icon: 'settings-outline' },
    { id: 'slideshow', title: 'Slideshow', icon: 'images-outline' }
  ];

  return (
    <View style={styles.container}>
      {/* Tab navigation */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? "#4f46e5" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.contentContainer}>
        {activeTab === 'general' ? (
          <AppConfigForm
            initialConfig={appConfig}
            onChange={setAppConfig}
            onSave={saveAppConfig}
            isLoading={isLoading}
          />
        ) : (
          <AdminFavoritesSettings />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  }
});

export default AppConfigTabs;