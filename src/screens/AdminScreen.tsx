// src/screens/AdminScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Switch, Alert, ActivityIndicator,
  Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { adminService, photoService } from '@/api/supabase';
//import { getCategories } from '@/services/catalogService';

const AdminScreen = ({ navigation }) => {
  // Check if user is admin
  const { isAdmin, userProfile } = useAuth();
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('settings');
  
  // Category management
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  
  // User management
  const [users, setUsers] = useState<any[]>([]);
  
  // Stats state
  const [photoStats, setPhotoStats] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'content') {
      loadCategories();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'settings') {
      loadStats();
    }
  }, [activeTab]);
  
  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Load photo statistics
      const { data: stats, error: statsError } = await photoService.getPhotoStats();
      if (statsError) throw statsError;
      setPhotoStats(stats);
      
      // Load storage statistics
      const { data: storageSize, error: storageError } = await adminService.getStorageSize('picaloco', '');
      if (storageError) throw storageError;
      setStorageStats({
        totalSize: storageSize,
        formattedSize: formatBytes(storageSize)
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      
      // Use the new API service to load categories
      const { data, error } = await photoService.getCategories({ forceFresh: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Use the admin service to get users
      const { data, error } = await adminService.getUsers();
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      
      // Use the admin service to toggle admin role
      const { error } = await adminService.toggleAdminRole(userId, currentStatus);
      
      if (error) throw error;
      
      // Refresh user list
      await loadUsers();
      
      Alert.alert('Success', `User admin status ${currentStatus ? 'removed' : 'granted'}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      Alert.alert('Error', 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // This feature requires direct database access, so we'll simulate it for now
      Alert.alert(
        "Add Category",
        "This would add a new category. This feature requires direct database access.",
        [{ text: "OK" }]
      );
      
      // In a real implementation, you would call the appropriate adminService method
      // const { error } = await adminService.categories.create({ name: newCategory, created_by: userProfile.id });
      
      setNewCategory('');
      // After successful creation, refresh the list
      // await loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditCategory = async () => {
    if (!editedCategory.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // This feature requires direct database access, so we'll simulate it for now
      Alert.alert(
        "Edit Category",
        "This would edit the category. This feature requires direct database access.",
        [{ 
          text: "OK", 
          onPress: () => {
            setEditCategoryModal(false);
            setSelectedCategory('');
            setEditedCategory('');
          } 
        }]
      );
      
      // In a real implementation, you would call the appropriate adminService method
      // const { error } = await adminService.categories.update(selectedCategory, { name: editedCategory });
      
      // After successful update, refresh the list
      // await loadCategories();
    } catch (error) {
      console.error('Error editing category:', error);
      Alert.alert('Error', 'Failed to edit category');
    } finally {
      setIsLoading(false);
      setEditCategoryModal(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Confirm deletion
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              
              // This feature requires direct database access, so we'll simulate it for now
              Alert.alert(
                "Delete Category",
                "This would delete the category. This feature requires direct database access.",
                [{ text: "OK" }]
              );
              
              // In a real implementation, you would call the appropriate adminService method
              // const { error } = await adminService.categories.delete(categoryId);
              
              // After successful deletion, refresh the list
              // await loadCategories();
              
              setIsLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
      setIsLoading(false);
    }
  };
  
  const handleReduceStorage = async () => {
    try {
      setIsLoading(true);
      
      // Confirm storage reduction
      Alert.alert(
        "Reduce Storage",
        "This will remove oldest files to reduce storage size. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reduce",
            style: "destructive",
            onPress: async () => {
              // Set target size to 1GB
              const targetSize = 1073741824; // 1GB in bytes
              
              const { data, error } = await adminService.reduceStorage('picaloco', '', targetSize);
              
              if (error) throw error;
              
              Alert.alert('Success', `Storage reduced to ${formatBytes(data || 0)}`);
              await loadStats();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error reducing storage:', error);
      Alert.alert('Error', 'Failed to reduce storage');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="lock-closed" size={48} color="#d1d5db" />
          <Text style={styles.unauthorizedText}>You do not have permission to access this area</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
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
            Dashboard
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
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        
        {!isLoading && activeTab === 'settings' && (
          <View>
            {/* Statistics Dashboard */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics Overview</Text>
              
              {photoStats && (
                <View>
                  <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Photos</Text>
                    <Text style={styles.statValue}>{photoStats.totalPhotos || 0}</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <View style={[styles.statCard, styles.statCardHalf]}>
                      <Text style={styles.statTitle}>Categories</Text>
                      <Text style={styles.statValue}>{photoStats.categoryStats?.length || 0}</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardHalf]}>
                      <Text style={styles.statTitle}>Photographers</Text>
                      <Text style={styles.statValue}>{photoStats.photographerStats?.length || 0}</Text>
                    </View>
                  </View>
                </View>
              )}
              
              {/* Storage Statistics */}
              {storageStats && (
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statTitle}>Storage Usage</Text>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={handleReduceStorage}
                    >
                      <Text style={styles.actionButtonText}>Reduce</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.statValue}>{storageStats.formattedSize}</Text>
                </View>
              )}
            </View>
            
            {/* System Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supabase Configuration</Text>
              <Text style={styles.infoText}>Manage application settings and configurations.</Text>
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Storage Settings</Text>
                  <Text style={styles.settingDescription}>Manage storage buckets and permissions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>API Keys</Text>
                  <Text style={styles.settingDescription}>View and manage API keys</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Database Settings</Text>
                  <Text style={styles.settingDescription}>Configure database settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {!isLoading && activeTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <Text style={styles.infoText}>Manage user accounts and permissions.</Text>
            
            {users.length > 0 ? (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userItem}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name || 'User'}</Text>
                      <Text style={styles.userDate}>
                        Joined {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.userActions}>
                      <Text style={styles.roleLabel}>Admin</Text>
                      <Switch
                        value={item.isAdmin}
                        onValueChange={() => handleToggleAdmin(item.id, item.isAdmin)}
                        trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                        thumbColor="#ffffff"
                      />
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.usersList}
              />
            ) : (
              <Text style={styles.emptyListText}>No users found</Text>
            )}
          </View>
        )}
        
        {!isLoading && activeTab === 'content' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Management</Text>
            <Text style={styles.infoText}>Manage photo categories for the application.</Text>
            
            <View style={styles.addCategoryContainer}>
              <TextInput
                style={styles.categoryInput}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="New category name"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={styles.categoryItem}>
                    <Text style={styles.categoryName}>{item}</Text>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setSelectedCategory(item);
                          setEditedCategory(item);
                          setEditCategoryModal(true);
                        }}
                      >
                        <Ionicons name="create-outline" size={18} color="#4f46e5" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCategory(item)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.categoriesList}
              />
            ) : (
              <Text style={styles.emptyListText}>No categories found</Text>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Edit Category Modal */}
      <Modal
        visible={editCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
              <TouchableOpacity onPress={() => setEditCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedCategory}
                  onChangeText={setEditedCategory}
                  placeholder="Category name"
                />
              </View>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditCategory}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
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
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  settingsItem: {
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
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // User management styles
  usersList: {
    paddingTop: 8,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  userDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 8,
  },
  
  // Category management styles
  addCategoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesList: {
    paddingTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginTop: 16,
    fontStyle: 'italic',
  },
  
  // Unauthorized screen
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Statistics styles
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statCardHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  statRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AdminScreen;