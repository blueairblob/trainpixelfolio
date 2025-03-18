
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Image, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../services/userService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, favorites

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              // Clear auth tokens
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userRole');
              
              // In a real app, you'd have a global auth context to handle this
              // For now, just reload the app which will show the login screen
              Alert.alert(
                "Logged Out", 
                "You have been logged out successfully.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Sample user data - in a real app this would come from an API
  const userData = user || {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isAdmin: false,
    memberSince: "January 2023",
    orders: [
      { id: "ORD-1234", date: "2023-05-15", total: 129.97, status: "Completed" },
      { id: "ORD-2345", date: "2023-06-22", total: 79.99, status: "Processing" }
    ],
    favorites: [
      { id: "photo1", title: "Vintage Steam Locomotive", photographer: "John Smith", imageUrl: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a" },
      { id: "photo3", title: "Mountain Railway", photographer: "Alice Williams", imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1" }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: userData.avatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'profile' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="person-outline" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.settingText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.settingText}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="card-outline" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.settingText}>Payment Methods</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            {userData.isAdmin && (
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('Admin')}
              >
                <View style={styles.settingIconContainer}>
                  <Ionicons name="settings-outline" size={20} color="#4f46e5" />
                </View>
                <Text style={styles.settingText}>Admin Dashboard</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={[styles.settingIconContainer, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Orders</Text>
            
            {userData.orders.length > 0 ? (
              userData.orders.map((order) => (
                <TouchableOpacity 
                  key={order.id}
                  style={styles.orderItem}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <View style={[
                      styles.orderStatusBadge,
                      order.status === "Completed" ? styles.completedStatus : styles.processingStatus
                    ]}>
                      <Text style={styles.orderStatusText}>{order.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>Ordered on {order.date}</Text>
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No orders yet</Text>
                <Text style={styles.emptyStateMessage}>
                  Your order history will appear here
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => navigation.navigate('Gallery')}
                >
                  <Text style={styles.browseButtonText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            
            {userData.favorites.length > 0 ? (
              userData.favorites.map((favorite) => (
                <TouchableOpacity 
                  key={favorite.id}
                  style={styles.favoriteItem}
                  onPress={() => navigation.navigate('PhotoDetail', { id: favorite.id })}
                >
                  <Image 
                    source={{ uri: favorite.imageUrl }}
                    style={styles.favoriteImage}
                  />
                  <View style={styles.favoriteDetails}>
                    <Text style={styles.favoriteTitle}>{favorite.title}</Text>
                    <Text style={styles.favoritePhotographer}>{favorite.photographer}</Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteRemoveButton}>
                    <Ionicons name="heart" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="heart-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No favorites yet</Text>
                <Text style={styles.emptyStateMessage}>
                  Save photos you like for later
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => navigation.navigate('Gallery')}
                >
                  <Text style={styles.browseButtonText}>Browse Photos</Text>
                </TouchableOpacity>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    margin: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#ef4444',
  },
  orderItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  completedStatus: {
    backgroundColor: '#dcfce7',
  },
  processingStatus: {
    backgroundColor: '#ffedd5',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  favoriteDetails: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  favoritePhotographer: {
    fontSize: 14,
    color: '#6b7280',
  },
  favoriteRemoveButton: {
    padding: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
