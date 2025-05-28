// src/components/admin/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, authService } from '@/api/supabase';
import { useAuth } from '@/context/AuthContext';

// Enhanced user interface
interface EnhancedUser {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  raw_user_meta_data: any;
  favorites_count?: number;
  orders_count?: number;
}

interface UserManagementProps {
  isVisible?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ isVisible = true }) => {
  const { isAdmin, userProfile } = useAuth();
  
  // State management
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'last_sign_in_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [isUserDetailModalVisible, setIsUserDetailModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  
  // Add user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  });

  // Load users on component mount and when filters change
  useEffect(() => {
    if (isVisible) {
      loadUsers();
    }
  }, [isVisible, currentPage, sortBy, sortOrder]);

  // Filter users when search query or role filter changes
  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterRole]);

  // Load users from Supabase
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get users from admin service with enhanced options
      const { data: userData, error: userError } = await adminService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        orderBy: sortBy,
        orderDirection: sortOrder
      });
      
      if (userError) throw userError;
      
      // Enhance user data with additional information
      const enhancedUsers = await Promise.all(
        (userData || []).map(async (user) => {
          // Get additional stats for each user (favorites, orders, etc.)
          const [favoritesCount, ordersCount] = await Promise.all([
            getUserFavoritesCount(user.id),
            getUserOrdersCount(user.id)
          ]);
          
          return {
            ...user,
            favorites_count: favoritesCount,
            orders_count: ordersCount,
            // Add email and other metadata if available from auth
            email: user.email || 'No email',
            last_sign_in_at: user.last_sign_in_at || null,
            email_confirmed_at: user.email_confirmed_at || null,
            phone: user.phone || null,
            raw_user_meta_data: user.raw_user_meta_data || {}
          } as EnhancedUser;
        })
      );
      
      setUsers(enhancedUsers);
      setTotalUsers(enhancedUsers.length); // In a real app, you'd get this from a count query
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder]);

  // Get user favorites count (placeholder implementation)
  const getUserFavoritesCount = async (userId: string): Promise<number> => {
    try {
      // In a real implementation, you'd query the favorites table
      // For now, return a random number for demo purposes
      return Math.floor(Math.random() * 20);
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  };

  // Get user orders count (placeholder implementation)
  const getUserOrdersCount = async (userId: string): Promise<number> => {
    try {
      // In a real implementation, you'd query the orders table
      // For now, return a random number for demo purposes
      return Math.floor(Math.random() * 10);
    } catch (error) {
      console.error('Error getting orders count:', error);
      return 0;
    }
  };

  // Filter users based on search query and role filter
  const filterUsers = useCallback(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => 
        filterRole === 'admin' ? user.isAdmin : !user.isAdmin
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, filterRole]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  }, [loadUsers]);

  // Toggle admin role
  const handleToggleAdmin = async (user: EnhancedUser) => {
    // Prevent self-demotion
    if (user.id === userProfile?.id && user.isAdmin) {
      Alert.alert(
        'Cannot Demote Self',
        'You cannot remove your own admin privileges. Have another admin perform this action.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const action = user.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to';
    const actionPast = user.isAdmin ? 'removed admin privileges from' : 'granted admin privileges to';
    
    Alert.alert(
      'Confirm Role Change',
      `Are you sure you want to ${action} ${user.name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: user.isAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              const { error } = await adminService.toggleAdminRole(user.id, user.isAdmin);
              
              if (error) throw error;
              
              // Update local state
              setUsers(prev => prev.map(u => 
                u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
              ));
              
              Alert.alert('Success', `Successfully ${actionPast} ${user.name || user.email}`);
            } catch (err) {
              console.error('Error toggling admin role:', err);
              Alert.alert('Error', 'Failed to update user role');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  // Delete user
  const handleDeleteUser = (user: EnhancedUser) => {
    // Prevent self-deletion
    if (user.id === userProfile?.id) {
      Alert.alert(
        'Cannot Delete Self',
        'You cannot delete your own account from the admin panel.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedUser(user);
    setIsDeleteConfirmVisible(true);
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSaving(true);
      
      // In a real implementation, you'd call an admin service to delete the user
      // This might involve calling Supabase Auth Admin API
      Alert.alert(
        'Feature Not Implemented',
        'User deletion functionality needs to be implemented with Supabase Auth Admin API.',
        [{ text: 'OK' }]
      );
      
      setIsDeleteConfirmVisible(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new user
  const handleAddUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (newUserForm.password !== newUserForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Register new user (this is a simplified version)
      const { user, error } = await authService.signUp(
        newUserForm.name,
        newUserForm.email,
        newUserForm.password
      );
      
      if (error) throw error;
      
      // If admin role should be assigned
      if (newUserForm.isAdmin && user) {
        await adminService.toggleAdminRole(user.id, false); // Grant admin role
      }
      
      // Reset form and reload users
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        isAdmin: false
      });
      
      setIsAddUserModalVisible(false);
      await loadUsers();
      
      Alert.alert('Success', 'User created successfully');
    } catch (err) {
      console.error('Error creating user:', err);
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
  };

  // Render user item
  const renderUserItem = ({ item }: { item: EnhancedUser }) => (
    <View style={styles.userItem}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => {
          setSelectedUser(item);
          setIsUserDetailModalVisible(true);
        }}
      >
        <View style={styles.userAvatar}>
          {item.avatar_url ? (
            <Text style={styles.avatarText}>
              {(item.name || item.email || 'U').charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={20} color="#9ca3af" />
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name || 'Unnamed User'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userMeta}>
            Joined {formatDate(item.created_at)} • Last seen {formatRelativeTime(item.last_sign_in_at)}
          </Text>
          {item.favorites_count !== undefined && (
            <Text style={styles.userStats}>
              {item.favorites_count} favorites • {item.orders_count} orders
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.userActions}>
        <View style={styles.adminToggle}>
          <Text style={styles.roleLabel}>Admin</Text>
          <Switch
            value={item.isAdmin}
            onValueChange={() => handleToggleAdmin(item)}
            trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
            thumbColor="#ffffff"
            disabled={isSaving || item.id === userProfile?.id}
          />
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item)}
          disabled={isSaving || item.id === userProfile?.id}
        >
          <Ionicons 
            name="trash-outline" 
            size={18} 
            color={item.id === userProfile?.id ? "#d1d5db" : "#ef4444"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="lock-closed" size={48} color="#d1d5db" />
        <Text style={styles.unauthorizedText}>
          Only administrators can access user management.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddUserModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>
      
      {/* Search and filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Role:</Text>
            <View style={styles.roleFilter}>
              {['all', 'admin', 'user'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleFilterButton,
                    filterRole === role && styles.activeRoleFilter
                  ]}
                  onPress={() => setFilterRole(role as any)}
                >
                  <Text style={[
                    styles.roleFilterText,
                    filterRole === role && styles.activeRoleFilterText
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? "arrow-up" : "arrow-down"} 
              size={16} 
              color="#4f46e5" 
            />
            <Text style={styles.sortButtonText}>
              {sortBy === 'created_at' ? 'Date Joined' : sortBy}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* User list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.userList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#4f46e5']}
              tintColor="#4f46e5"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search criteria' : 'No users have signed up yet'}
              </Text>
            </View>
          }
          ListFooterComponent={
            filteredUsers.length > 0 ? (
              <View style={styles.listFooter}>
                <Text style={styles.footerText}>
                  Showing {filteredUsers.length} of {totalUsers} users
                </Text>
              </View>
            ) : null
          }
        />
      )}
      
      {/* User Detail Modal */}
      <Modal
        visible={isUserDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsUserDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity 
                onPress={() => setIsUserDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedUser && (
                <View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Basic Information</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{selectedUser.name || 'Not provided'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{selectedUser.email}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Role:</Text>
                      <Text style={[styles.detailValue, selectedUser.isAdmin && styles.adminText]}>
                        {selectedUser.isAdmin ? 'Administrator' : 'User'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Account Information</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Created:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedUser.created_at)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Last Sign In:</Text>
                      <Text style={styles.detailValue}>{formatRelativeTime(selectedUser.last_sign_in_at)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Email Verified:</Text>
                      <Text style={styles.detailValue}>
                        {selectedUser.email_confirmed_at ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Activity</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Favorites:</Text>
                      <Text style={styles.detailValue}>{selectedUser.favorites_count || 0}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Orders:</Text>
                      <Text style={styles.detailValue}>{selectedUser.orders_count || 0}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add User Modal */}
      <Modal
        visible={isAddUserModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity 
                onPress={() => setIsAddUserModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newUserForm.name}
                  onChangeText={(text) => setNewUserForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter user's name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newUserForm.email}
                  onChangeText={(text) => setNewUserForm(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newUserForm.password}
                  onChangeText={(text) => setNewUserForm(prev => ({ ...prev, password: text }))}
                  placeholder="Enter password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm Password *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newUserForm.confirmPassword}
                  onChangeText={(text) => setNewUserForm(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Confirm password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.switchGroup}>
                <Text style={styles.formLabel}>Admin Role</Text>
                <Switch
                  value={newUserForm.isAdmin}
                  onValueChange={(value) => setNewUserForm(prev => ({ ...prev, isAdmin: value }))}
                  trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
                  thumbColor="#ffffff"
                />
              </View>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddUser}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.createButtonText}>Create User</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete User</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete {selectedUser?.name || selectedUser?.email}? 
              This action cannot be undone.
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteUser}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  roleFilter: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 2,
  },
  roleFilterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeRoleFilter: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  roleFilterText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeRoleFilterText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#4f46e5',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  userList: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#4f46e5',
  },
  userActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminToggle: {
    alignItems: 'center',
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  adminText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirmation modal styles
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  confirmDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
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
  },
});

export default UserManagement;