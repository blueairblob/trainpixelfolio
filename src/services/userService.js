
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get user profile
export const getUserProfile = async () => {
  try {
    // In a real app, you would fetch this from an API based on the authenticated user
    // For now, we'll use a mock profile
    
    // Get sample order history
    const orders = [
      { id: "ORD-1234", date: "2023-05-15", total: 129.97, status: "Completed" },
      { id: "ORD-2345", date: "2023-06-22", total: 79.99, status: "Processing" }
    ];
    
    // Get sample favorites
    const favorites = await getFavorites();
    
    // Get token and check if user is admin
    const userToken = await AsyncStorage.getItem('userToken');
    const userRole = await AsyncStorage.getItem('userRole');
    
    if (!userToken) {
      throw new Error('Not authenticated');
    }
    
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isAdmin: userRole === 'admin',
      memberSince: "January 2023",
      orders,
      favorites
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Get user favorites
export const getFavorites = async () => {
  try {
    const favoritesJson = await AsyncStorage.getItem('favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Add to favorites
export const addToFavorites = async (photoId) => {
  try {
    const favoritesJson = await AsyncStorage.getItem('favorites');
    const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
    
    if (!favorites.includes(photoId)) {
      const updatedFavorites = [...favorites, photoId];
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove from favorites
export const removeFromFavorites = async (photoId) => {
  try {
    const favoritesJson = await AsyncStorage.getItem('favorites');
    const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
    
    const updatedFavorites = favorites.filter(id => id !== photoId);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    // Check if user is admin
    const userRole = await AsyncStorage.getItem('userRole');
    
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    // Get users from storage
    const usersJson = await AsyncStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Return sanitized user data (without passwords)
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};
