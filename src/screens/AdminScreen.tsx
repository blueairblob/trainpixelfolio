
// AdminScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Switch, Alert, ActivityIndicator,
  Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { fetchCategories } from '@/services/catalogService';

const AdminScreen = ({ navigation }) => {
  // Check if user is admin
  const { isAdmin } = useAuth();
  
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
  
  // Load categories
  useEffect(() => {
    if (activeTab === 'content') {
      loadCategories();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);
  
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categories = await fetchCategories();
      setCategories(categories);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, created_at');
      
      if (error) throw error;
      
      // Get admin status for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const { data: isAdminData } = await supabase
            .rpc('is_admin', { user_id: user.id });
          
          return {
            ...user,
            isAdmin: isAdminData || false
          };
        })
      );
      
      setUsers(usersWithRoles);
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
      
      if (currentStatus) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
      }
      
      // Refresh user list
      await loadUsers();
      
    } catch (error) {
      console.error('Error toggling admin status:', error);
      Alert.alert('Error', 'Failed to update user role');
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
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        
        {!isLoading && activeTab === 'settings' && (
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
                onPress={() => {
                  Alert.alert(
                    "Add Category",
                    "This would add a new category. This feature requires direct database access.",
                    [{ text: "OK" }]
                  );
                }}
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
                        onPress={() => {
                          Alert.alert(
                            "Delete Category",
                            "Are you sure you want to delete this category?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                  Alert.alert(
                                    "Delete Category",
                                    "This would delete the category. This feature requires direct database access.",
                                    [{ text: "OK" }]
                                  );
                                }
                              }
                            ]
                          );
                        }}
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
                onPress={() => {
                  Alert.alert(
                    "Edit Category",
                    "This would edit the category. This feature requires direct database access.",
                    [
                      { text: "OK", onPress: () => setEditCategoryModal(false) }
                    ]
                  );
                }}
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
});

export default AdminScreen;
