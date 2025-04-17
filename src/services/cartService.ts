
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPhotoById } from './catalogService';

const CART_STORAGE_KEY = 'user_cart';

// Get cart items with full photo details
export const getCartItems = async () => {
  try {
    // Get cart from storage
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    // If cart is empty, return empty array
    if (cart.length === 0) {
      return [];
    }
    
    // Get full details for each photo in cart
    const cartItemsWithDetails = await Promise.all(
      cart.map(async (item) => {
        const photo = await getPhotoById(item.id);
        return {
          ...photo,
          quantity: item.quantity
        };
      })
    );
    
    return cartItemsWithDetails;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

// Add item to cart
export const addToCart = async (photoId, quantity = 1) => {
  try {
    // Get current cart
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === photoId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist
      cart.push({ id: photoId, quantity });
    }
    
    // Save updated cart
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    
    return cart;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (photoId, quantity) => {
  try {
    // Get current cart
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    // Find the item
    const existingItemIndex = cart.findIndex(item => item.id === photoId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity = quantity;
      
      // Save updated cart
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
    
    return cart;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (photoId) => {
  try {
    // Get current cart
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    // Filter out the item to remove
    const updatedCart = cart.filter(item => item.id !== photoId);
    
    // Save updated cart
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    
    return updatedCart;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Get cart count (number of items)
export const getCartCount = async () => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};
