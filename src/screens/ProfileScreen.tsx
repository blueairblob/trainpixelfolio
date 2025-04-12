// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoritesTab from '@/components/FavoritesTab'; // Import the FavoritesTab component

const ProfileScreen = ({ navigation }) => {
  const { 
    isAuthenticated, 
    userProfile, 
    isAdmin, 
    logout, 
    isGuest, 
    enableGuestMode, 
    disableGuestMode 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/hide passwords
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Clear any local storage if needed
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    // Profile update logic here
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Password change logic here
    Alert.alert('Success', 'Password changed successfully');
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAdminAccess = () => {
    navigation.navigate('Admin');
  };

  const handleContinueAsGuest = () => {
    enableGuestMode();
  };
  
  const handleSignIn = () => {
    if (isGuest) {
      disableGuestMode();
    }
    navigation.navigate('AuthScreen');
  };

  // If not authenticated and not in guest mode, show login/guest options
  if (!isAuthenticated && !isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80' }}
            style={styles.logo}
          />
          <Text style={styles.title}>TrainPhoto</Text>
          <Text style={styles.subtitle}>Sign in to access your profile</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleSignIn}
            >
              <Text style={styles.primaryButtonText}>Sign In / Register</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleContinueAsGuest}
            >
              <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render profile for authenticated or guest users
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            userProfile?.avatar_url 
              ? { uri: userProfile.avatar_url } 
              : require('../../assets/icon.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
        {isGuest && (
          <View style={styles.guestBadge}>
            <Text style={styles.guestBadgeText}>Guest Mode</Text>
          </View>
        )}
        
        {isAuthenticated && !isGuest && (
          <Text style={styles.memberSince}>
            Member since {userProfile?.created_at 
              ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
              : 'Recently'}
          </Text>
        )}
        
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
        
        {isAuthenticated && !isGuest && (
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
        )}
        
        {isGuest && (
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        
        {isAdmin && isAuthenticated && !isGuest && (
          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={handleAdminAccess}
          >
            <Text style={styles.adminButtonText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]} 
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Profile Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]} 
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorites</Text>
        </TouchableOpacity>
        
        {isAuthenticated && !isGuest && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]} 
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content area based on selected tab */}
      <ScrollView contentContainerStyle={
        activeTab === 'favorites' 
          ? styles.scrollContentFavorites 
          : styles.scrollContent
      }>
        {activeTab === 'info' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{userProfile?.name || 'Not Set'}</Text>
            </View>
            {isAuthenticated && !isGuest && (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{userProfile?.email || 'Not Set'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Account Type:</Text>
                  <Text style={styles.infoValue}>{isAdmin ? 'Administrator' : 'Standard User'}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Order History</Text>
            {isGuest ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No Order History</Text>
                <Text style={styles.emptyStateText}>
                  Please sign in to view your orders.
                </Text>
              </View>
            ) : userProfile?.orders?.length ? (
              userProfile.orders.map((order, index) => (
                <View key={index} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>{order.id}</Text>
                    <Text style={[styles.orderStatus, 
                      order.status === 'Completed' ? styles.statusCompleted : 
                      order.status === 'Processing' ? styles.statusProcessing :
                      styles.statusPending
                    ]}>
                      {order.status}
                    </Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>{order.date}</Text>
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No orders yet</Text>
                <Text style={styles.emptyStateText}>
                  When you make purchases, they will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'favorites' && (
          <View style={[styles.sectionContainer, styles.favoritesContainer]}>
            <FavoritesTab navigation={navigation} />
          </View>
        )}

        {activeTab === 'settings' && isAuthenticated && !isGuest && (
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
            
            <View style={styles.settingsSection}>
              <Text style={styles.settingsHeader}>Change Password</Text>
              {isChangingPassword ? (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Ionicons 
                        name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter new password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons 
                        name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm new password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleChangePassword}
                    >
                      <Text style={[styles.buttonText, styles.saveButtonText]}>Change Password</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => setIsChangingPassword(true)}
                >
                  <Text style={styles.settingsButtonText}>Change Password</Text>
                  <Ionicons name="chevron-forward" size={20} color="#4f46e5" />
                </TouchableOpacity>
              )}
            </View>
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 16,
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
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentFavorites: {
    flexGrow: 1,
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
    padding: 0,
    margin: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
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
  orderCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
  },
  orderStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusProcessing: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    color: '#6b7280',
    fontSize: 14,
  },
  orderTotal: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  eyeIcon: {
    padding: 12,
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