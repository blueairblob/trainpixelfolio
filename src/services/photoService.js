
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample data
const samplePhotos = [
  {
    id: 'photo1',
    title: 'Vintage Steam Locomotive',
    description: 'A beautifully restored steam locomotive passing through mountain scenery.',
    photographer: 'John Smith',
    location: 'Swiss Alps',
    price: 49.99,
    tags: ['steam', 'vintage', 'mountain'],
    imageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  },
  {
    id: 'photo2',
    title: 'Modern High-Speed Train',
    description: 'A sleek, modern high-speed train speeding through the countryside.',
    photographer: 'Sarah Johnson',
    location: 'Japan',
    price: 39.99,
    tags: ['modern', 'high-speed', 'technology'],
    imageUrl: 'https://images.unsplash.com/photo-1679679008383-6f778fe07382?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 'photo3',
    title: 'Mountain Railway',
    description: 'A traditional railway winding through breathtaking mountain scenery.',
    photographer: 'Alice Williams',
    location: 'Rocky Mountains',
    price: 59.99,
    tags: ['scenic', 'mountain', 'landscape'],
    imageUrl: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
  },
  {
    id: 'photo4',
    title: 'Historic Railway Station',
    description: 'The grand architecture of a historic European railway station.',
    photographer: 'Michael Brown',
    location: 'Paris, France',
    price: 44.99,
    tags: ['stations', 'historic', 'architecture'],
    imageUrl: 'https://images.unsplash.com/photo-1609618996942-44532fa2e24d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 'photo5',
    title: 'Old Train in City',
    description: 'Vintage train passing through a modern urban area, contrasting old and new.',
    photographer: 'David Chen',
    location: 'Berlin, Germany',
    price: 34.99,
    tags: ['urban', 'vintage', 'city'],
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80',
  },
  {
    id: 'photo6',
    title: 'Night Train',
    description: 'A long-exposure shot of a train moving through the night, creating light trails.',
    photographer: 'Emma Davis',
    location: 'Chicago, USA',
    price: 54.99,
    tags: ['night', 'modern', 'artistic'],
    imageUrl: 'https://images.unsplash.com/photo-1553696590-4b3f68898333?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];

// Initialize storage with sample data on first run
const initializeStorage = async () => {
  try {
    const existingPhotos = await AsyncStorage.getItem('photos');
    if (!existingPhotos) {
      await AsyncStorage.setItem('photos', JSON.stringify(samplePhotos));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call initialization when the file is imported
initializeStorage();

// Get all photos
export const getAllPhotos = async () => {
  try {
    const photosJson = await AsyncStorage.getItem('photos');
    return photosJson ? JSON.parse(photosJson) : [];
  } catch (error) {
    console.error('Error getting photos:', error);
    return [];
  }
};

// Get a single photo by ID
export const getPhotoById = async (id) => {
  try {
    const photosJson = await AsyncStorage.getItem('photos');
    const photos = photosJson ? JSON.parse(photosJson) : [];
    return photos.find(photo => photo.id === id);
  } catch (error) {
    console.error('Error getting photo by ID:', error);
    return null;
  }
};

// Add a new photo
export const addPhoto = async (photoData) => {
  try {
    const photosJson = await AsyncStorage.getItem('photos');
    const photos = photosJson ? JSON.parse(photosJson) : [];
    
    const newPhoto = {
      ...photoData,
      id: `photo${Date.now()}`, // Generate a unique ID
    };
    
    const updatedPhotos = [...photos, newPhoto];
    await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
    
    return newPhoto;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
};

// Update an existing photo
export const updatePhoto = async (id, photoData) => {
  try {
    const photosJson = await AsyncStorage.getItem('photos');
    const photos = photosJson ? JSON.parse(photosJson) : [];
    
    const updatedPhotos = photos.map(photo => 
      photo.id === id ? { ...photo, ...photoData } : photo
    );
    
    await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
    
    return updatedPhotos.find(photo => photo.id === id);
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
};

// Delete a photo
export const deletePhoto = async (id) => {
  try {
    const photosJson = await AsyncStorage.getItem('photos');
    const photos = photosJson ? JSON.parse(photosJson) : [];
    
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
    
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
