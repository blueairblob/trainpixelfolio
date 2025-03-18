
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPhotoById } from './photoService';

// Get all cart items
export const getCartItems = async () => {
  try {
    const cartJson = await AsyncStorage.getItem('cart');
    
    // If no cart exists yet, return empty array
    if (!cartJson) {
      return [];
    }
    
    // Parse cart data
    const cartItems = JSON.parse(cartJson);
    
    // Get full details for each item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const photo = await getPhotoById(item.id);
        return {
          ...photo,
          quantity: item.quantity
        };
      })
    );
    
    return itemsWithDetails.filter(item => item); // Filter out any null items
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

// Add item to cart
export const addToCart = async (photoId, quantity = 1) => {
  try {
    // Get photo details
    const photo = await getPhotoById(photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }
    
    // Get current cart
    const cartJson = await AsyncStorage.getItem('cart');
    const cart = cartJson ? JSON.parse(cartJson) : [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === photoId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist
      cart.push({
        id: photoId,
        quantity
      });
    }
    
    // Save updated cart
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    
    return await getCartItems();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (photoId, quantity) => {
  try {
    // Get current cart
    const cartJson = await AsyncStorage.getItem('cart');
    if (!cartJson) {
      throw new Error('Cart not found');
    }
    
    const cart = JSON.parse(cartJson);
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === photoId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity > 0) {
      // Update quantity
      cart[itemIndex].quantity = quantity;
    } else {
      // Remove item if quantity is 0 or negative
      cart.splice(itemIndex, 1);
    }
    
    // Save updated cart
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    
    return await getCartItems();
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (photoId) => {
  try {
    // Get current cart
    const cartJson = await AsyncStorage.getItem('cart');
    if (!cartJson) {
      return [];
    }
    
    const cart = JSON.parse(cartJson);
    
    // Remove the item
    const updatedCart = cart.filter(item => item.id !== photoId);
    
    // Save updated cart
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    
    return await getCartItems();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem('cart');
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
