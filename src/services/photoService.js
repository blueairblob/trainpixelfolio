
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock photo data for demo purposes
const PHOTOS = [
  {
    id: '1',
    title: 'Steam Train in the Mountains',
    photographer: 'John Smith',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    location: 'Swiss Alps',
    description: 'A beautiful vintage steam train crossing the mountains in the Swiss Alps on a clear summer day.',
    categoryId: '1',
    createdAt: '2023-05-15',
    featured: true
  },
  {
    id: '2',
    title: 'Subway Train at Night',
    photographer: 'Sarah Johnson',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2084&q=80',
    location: 'New York City',
    description: 'A moody shot of a subway train arriving at the station late at night in New York City.',
    categoryId: '2',
    createdAt: '2023-06-20',
    featured: false
  },
  {
    id: '3',
    title: 'High-Speed Train',
    photographer: 'David Chen',
    price: 34.99,
    imageUrl: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    location: 'Tokyo, Japan',
    description: 'A Japanese bullet train (Shinkansen) speeding through the countryside near Tokyo.',
    categoryId: '3',
    createdAt: '2023-07-05',
    featured: false
  },
  {
    id: '4',
    title: 'Train on Historic Bridge',
    photographer: 'Emma Wilson',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1623811035446-63ea62979ada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    location: 'Edinburgh, Scotland',
    description: 'A historic train crossing the famous Forth Bridge in Scotland during sunset.',
    categoryId: '1',
    createdAt: '2023-04-30',
    featured: true
  },
  {
    id: '5',
    title: 'Freight Train in Desert',
    photographer: 'Michael Brown',
    price: 22.99,
    imageUrl: 'https://images.unsplash.com/photo-1531752074002-abf991376d04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    location: 'Arizona, USA',
    description: 'A long freight train carrying goods through the Arizona desert landscape.',
    categoryId: '4',
    createdAt: '2023-05-10',
    featured: false
  },
  {
    id: '6',
    title: 'Mountain Railway',
    photographer: 'Sophia Garcia',
    price: 27.99,
    imageUrl: 'https://images.unsplash.com/photo-1468805498375-1896a933aba9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    location: 'Colorado, USA',
    description: 'A scenic railway winding through the Rocky Mountains in Colorado during fall season.',
    categoryId: '1',
    createdAt: '2023-09-15',
    featured: false
  }
];

// Mock categories
const CATEGORIES = [
  { id: 'all', title: 'All Photos', icon: 'images-outline' },
  { id: '1', title: 'Steam Trains', icon: 'train-outline' },
  { id: '2', title: 'Subway & Metro', icon: 'subway-outline' },
  { id: '3', title: 'High-Speed', icon: 'flash-outline' },
  { id: '4', title: 'Freight', icon: 'cube-outline' }
];

export const getPhotos = async (categoryId = null) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filteredPhotos = [...PHOTOS];
  
  if (categoryId && categoryId !== 'all') {
    filteredPhotos = filteredPhotos.filter(photo => photo.categoryId === categoryId);
  }
  
  return filteredPhotos;
};

export const getPhotoById = async (id) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const photo = PHOTOS.find(photo => photo.id === id);
  
  if (!photo) {
    throw new Error('Photo not found');
  }
  
  return photo;
};

export const getFeaturedPhotos = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return PHOTOS.filter(photo => photo.featured);
};

export const getCategories = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return CATEGORIES;
};

export const searchPhotos = async (query) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!query || query.trim() === '') {
    return [];
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  return PHOTOS.filter(photo => 
    photo.title.toLowerCase().includes(lowercaseQuery) ||
    photo.photographer.toLowerCase().includes(lowercaseQuery) ||
    photo.location.toLowerCase().includes(lowercaseQuery) ||
    photo.description.toLowerCase().includes(lowercaseQuery)
  );
};
