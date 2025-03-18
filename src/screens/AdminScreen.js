
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, TextInput, Alert,
  ActivityIndicator, FlatList,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllPhotos, addPhoto, updatePhoto, deletePhoto } from '../services/photoService';
import { getAllUsers } from '../services/userService';

const AdminScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    photographer: '',
    location: '',
    price: '',
    tags: '',
    imageUrl: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'photos') {
        const photosData = await getAllPhotos();
        setPhotos(photosData);
      } else if (activeTab === 'users') {
        const usersData = await getAllUsers();
        setUsers(usersData);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
      Alert.alert('Error', `Failed to load ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = () => {
    setCurrentPhoto(null);
    setPhotoForm({
      title: '',
      description: '',
      photographer: '',
      location: '',
      price: '',
      tags: '',
      imageUrl: ''
    });
    setIsModalVisible(true);
  };

  const handleEditPhoto = (photo) => {
    setCurrentPhoto(photo);
    setPhotoForm({
      title: photo.title,
      description: photo.description,
      photographer: photo.photographer,
      location: photo.location,
      price: photo.price.toString(),
      tags: photo.tags.join(', '),
      imageUrl: photo.imageUrl
    });
    setIsModalVisible(true);
  };

  const handleSavePhoto = async () => {
    try {
      // Validate form
      if (!photoForm.title || !photoForm.price || !photoForm.imageUrl) {
        Alert.alert('Error', 'Title, price, and image URL are required.');
        return;
      }

      const photoData = {
        ...photoForm,
        price: parseFloat(photoForm.price),
        tags: photoForm.tags.split(',').map(tag => tag.trim())
      };

      if (currentPhoto) {
        // Update existing photo
        await updatePhoto(currentPhoto.id, photoData);
        Alert.alert('Success', 'Photo updated successfully.');
      } else {
        // Add new photo
        await addPhoto(photoData);
        Alert.alert('Success', 'Photo added successfully.');
      }

      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const handleDeletePhoto = (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              Alert.alert('Success', 'Photo deleted successfully.');
              loadData();
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderPhotoItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.listItemActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditPhoto(item)}
          >
            <Ionicons name="create-outline" size={16} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePhoto(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>By {item.photographer}</Text>
      <Text style={styles.listItemPrice}>${item.price.toFixed(2)}</Text>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <View style={styles.listItemActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
          >
            <Ionicons name="create-outline" size={16} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>{item.email}</Text>
      <View style={styles.userRoleBadge}>
        <Text style={styles.userRoleText}>{item.role}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading {activeTab}...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'photos' && (
              <>
                <View style={styles.actionBar}>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddPhoto}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.addButtonText}>Add Photo</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={photos}
                  renderItem={renderPhotoItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="images-outline" size={48} color="#d1d5db" />
                      <Text style={styles.emptyStateText}>No photos found</Text>
                    </View>
                  }
                />
              </>
            )}

            {activeTab === 'users' && (
              <>
                <View style={styles.actionBar}>
                  <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.addButtonText}>Add User</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={users}
                  renderItem={renderUserItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="people-outline" size={48} color="#d1d5db" />
                      <Text style={styles.emptyStateText}>No users found</Text>
                    </View>
                  }
                />
              </>
            )}

            {activeTab === 'orders' && (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>Orders management coming soon</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Photo Edit/Add Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentPhoto ? 'Edit Photo' : 'Add New Photo'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close-outline" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.title}
                  onChangeText={(text) => setPhotoForm({...photoForm, title: text})}
                  placeholder="Enter photo title"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={photoForm.description}
                  onChangeText={(text) => setPhotoForm({...photoForm, description: text})}
                  placeholder="Enter photo description"
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Photographer</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.photographer}
                  onChangeText={(text) => setPhotoForm({...photoForm, photographer: text})}
                  placeholder="Enter photographer name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.location}
                  onChangeText={(text) => setPhotoForm({...photoForm, location: text})}
                  placeholder="Enter photo location"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.price}
                  onChangeText={(text) => setPhotoForm({...photoForm, price: text})}
                  placeholder="Enter price"
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tags (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.tags}
                  onChangeText={(text) => setPhotoForm({...photoForm, tags: text})}
                  placeholder="e.g. steam, vintage, landscape"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL *</Text>
                <TextInput
                  style={styles.input}
                  value={photoForm.imageUrl}
                  onChangeText={(text) => setPhotoForm({...photoForm, imageUrl: text})}
                  placeholder="Enter image URL"
                />
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePhoto}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  listItemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#e0e7ff',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  userRoleBadge: {
    backgroundColor: '#e0e7ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4f46e5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingBottom: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default AdminScreen;
