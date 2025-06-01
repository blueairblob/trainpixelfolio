// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { canShowAuth, canShowAdminPanel, APP_CONFIG } from '@/config/features';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoritesTab from '@/components/FavoritesTab'; 

const ProfileScreen = ({ navigation }) => {
  const { 
    isAuthenticated, 
    userProfile, 
    isAdmin, 
    logout, 
    isGuest, 
    enableGuestMode, 
    disableGuestMode,
    updateProfile
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!canShowAuth()) {
      Alert.alert('Coming Soon', APP_CONFIG.MESSAGES.AUTH_DISABLED);
      return;
    }
    
    try {
      setIsLoading(true);
      await updateProfile({ name });
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = () => {
    if (!canShowAdminPanel()) {
      Alert.alert('Coming Soon', APP_CONFIG.MESSAGES.ADMIN_DISABLED);
      return;
    }
    navigation.navigate('AdminScreen');
  };

  const handleSignIn = async () => {
    if (!canShowAuth()) {
      Alert.alert('Coming Soon', APP_CONFIG.MESSAGES.AUTH_DISABLED);
      return;
    }
    
    if (isGuest) {
      await disableGuestMode();
      return;
    }
    
    navigation.navigate('AuthScreen');
  };

  // Render header content (same for both modes)
  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={
          userProfile?.avatar_url 
            ? { uri: userProfile.avatar_url } 
            : require('../../assets/icon.png')
        }
        style={styles.avatar}
      />
      <Text style={styles.userName}>{userProfile?.name || 'Guest User'}</Text>
      
      {isGuest && (
        <>
          <View style={styles.guestBadge}>
            <Text style={styles.guestBadgeText}>Guest Mode</Text>
          </View>
          
          <Text style={styles.guestMessage}>
            Browsing as a guest. Full account features will be available in a future update.
          </Text>
          
          {canShowAuth() && (
            <TouchableOpacity 
              style={styles.signInButton} 
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {isAuthenticated && !isGuest && (
        <>
          <Text style={styles.memberSince}>
            Member since {userProfile?.created_at 
              ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
              : 'Recently'}
          </Text>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      
      {isAdmin && canShowAdminPanel() && (
        <>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={handleAdminAccess}
          >
            <Text style={styles.adminButtonText}>Admin Dashboard</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'info' && styles.activeTab]} 
        onPress={() => setActiveTab('info')}
      >
        <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Profile Info</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]} 
        onPress={() => setActiveTab('favorites')}
      >
        <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorites</Text>
      </TouchableOpacity>
      
      {/* Only show settings tab for authenticated users */}
      {isAuthenticated && !isGuest && canShowAuth() && (
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render info tab content
  const renderInfoContent = () => (
    <View style={styles.sectionContainer}>
      {isAuthenticated && !isGuest ? (
        <>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{userProfile?.name || 'Not Set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userProfile?.email || 'Not Set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Type:</Text>
            <Text style={styles.infoValue}>{isAdmin ? 'Administrator' : 'Standard User'}</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Name:</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.APP_NAME}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.VERSION}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mode:</Text>
            <Text style={styles.infoValue}>Guest Browsing</Text>
          </View>
          
          <Text style={styles.featureNote}>
            This is an early access version. Account creation, photo purchasing, and other premium features will be available in future updates.
          </Text>
        </>
      )}
    </View>
  );

  // Render settings tab content
  const renderSettingsContent = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Account Settings</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsHeader}>Edit Profile</Text>
        {isEditing ? (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.settingsButtonText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#4f46e5" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // For favorites tab, we need to render it without wrapping in ScrollView
  if (activeTab === 'favorites') {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderTabNavigation()}
        {/* Render FavoritesTab directly without ScrollView wrapper */}
        <View style={styles.favoritesContainer}>
          <FavoritesTab navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

  // For other tabs, use ScrollView as normal
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabNavigation()}
      
      <ScrollView style={styles.tabContent}>
        {activeTab === 'info' && renderInfoContent()}
        {activeTab === 'settings' && renderSettingsContent()}
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
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  guestMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  adminBadge: {
    backgroundColor: '#c7d2fe',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  adminBadgeText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 12,
  },
  guestBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  guestBadgeText: {
    color: '#92400e',
    fontWeight: '600',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  adminButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  adminButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    borderBottomColor: '#4f46e5',
    borderBottomWidth: 2,
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
  },
  favoritesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    width: 100,
    fontWeight: '500',
    color: '#4b5563',
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
  },
  featureNote: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  saveButtonText: {
    color: '#ffffff',
  },
});

export default ProfileScreen;