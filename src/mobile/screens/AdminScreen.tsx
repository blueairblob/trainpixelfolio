
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Switch, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AdminScreen = ({ navigation }) => {
  // Mock Supabase configuration state
  const [supabaseUrl, setSupabaseUrl] = useState('https://example.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('eyJhbGc...');
  
  // Mock settings
  const [enableUserRegistration, setEnableUserRegistration] = useState(true);
  const [enableGoogleAuth, setEnableGoogleAuth] = useState(false);
  const [enableStripePayments, setEnableStripePayments] = useState(true);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('settings');
  
  const handleSaveSettings = () => {
    Alert.alert(
      "Save Settings",
      "Application settings have been saved successfully.",
      [{ text: "OK" }]
    );
  };
  
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the application cache?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: () => {
            // In a real app, this would clear the app's cache
            Alert.alert("Success", "Cache cleared successfully");
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings-outline" 
            size={18} 
            color={activeTab === 'settings' ? "#4f46e5" : "#6b7280"} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'settings' && styles.activeTabText
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons 
            name="people-outline" 
            size={18} 
            color={activeTab === 'users' ? "#4f46e5" : "#6b7280"} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'users' && styles.activeTabText
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Ionicons 
            name="images-outline" 
            size={18} 
            color={activeTab === 'content' ? "#4f46e5" : "#6b7280"} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'content' && styles.activeTabText
            ]}
          >
            Content
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={18} 
            color={activeTab === 'analytics' ? "#4f46e5" : "#6b7280"} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'analytics' && styles.activeTabText
            ]}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'settings' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supabase Configuration</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Supabase URL</Text>
                <TextInput 
                  style={styles.input}
                  value={supabaseUrl}
                  onChangeText={setSupabaseUrl}
                  placeholder="https://your-project.supabase.co"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Supabase Anon Key</Text>
                <TextInput 
                  style={styles.input}
                  value={supabaseAnonKey}
                  onChangeText={setSupabaseAnonKey}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity style={styles.testButton}>
                <Text style={styles.testButtonText}>Test Connection</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Authentication Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Enable User Registration</Text>
                </View>
                <Switch
                  value={enableUserRegistration}
                  onValueChange={setEnableUserRegistration}
                  trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Enable Google Authentication</Text>
                </View>
                <Switch
                  value={enableGoogleAuth}
                  onValueChange={setEnableGoogleAuth}
                  trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Enable Stripe Payments</Text>
                </View>
                <Switch
                  value={enableStripePayments}
                  onValueChange={setEnableStripePayments}
                  trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Stripe Public Key</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="pk_test_..."
                  secureTextEntry
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Stripe Secret Key</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="sk_test_..."
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maintenance</Text>
              
              <TouchableOpacity 
                style={styles.maintenanceButton}
                onPress={handleClearCache}
              >
                <Ionicons name="trash-outline" size={18} color="#4b5563" />
                <Text style={styles.maintenanceButtonText}>Clear Cache</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.maintenanceButton}>
                <Ionicons name="refresh-outline" size={18} color="#4b5563" />
                <Text style={styles.maintenanceButtonText}>Sync Database Schema</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.maintenanceButton}>
                <Ionicons name="download-outline" size={18} color="#4b5563" />
                <Text style={styles.maintenanceButtonText}>Export Data</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveSettings}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </>
        )}
        
        {activeTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <Text style={styles.placeholderText}>
              User management functionality would be implemented here.
            </Text>
          </View>
        )}
        
        {activeTab === 'content' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Management</Text>
            <Text style={styles.placeholderText}>
              Content management functionality would be implemented here.
            </Text>
          </View>
        )}
        
        {activeTab === 'analytics' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
            <Text style={styles.placeholderText}>
              Analytics dashboard would be implemented here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ebe9fe',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  testButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 14,
    color: '#4b5563',
  },
  maintenanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  maintenanceButtonText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default AdminScreen;
