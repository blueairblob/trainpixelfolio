// src/api/supabase/services/cartService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, CartItem, CartItemWithDetails } from '../types';
import { photoService } from './photoService';

// Keys for local storage
const GUEST_CART_KEY = 'guest-cart';
const USER_CART_PREFIX = 'user-cart-';

/**
 * Service for handling shopping cart operations
 */
export const cartService = {
  /**
   * Get cart items with details
   */
  getCartItems: async (options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<CartItemWithDetails[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      // Get the appropriate storage key based on authentication state
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      
      // Get cart from storage
      const cartJson = await AsyncStorage.getItem(storageKey);
      const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
      
      if (cart.length === 0) {
        return { data: [], error: null, status: 200 };
      }
      
      // Get full details for each item
      const cartItemsWithDetails = await Promise.all(
        cart.map(async (item) => {
          const { data: photo } = await photoService.getPhotoById(item.id);
          
          if (!photo) {
            throw new Error(`Failed to get details for photo ID: ${item.id}`);
          }
          
          return {
            ...item,
            title: photo.description || 'Untitled',
            imageUrl: photo.image_url || '',
            price: photo.price || 49.99, // Default price
            photographer: photo.photographer || 'Unknown',
            location: photo.location,
            description: photo.description
          };
        })
      );
      
      return { data: cartItemsWithDetails, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting cart items:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Add item to cart
   */
  addToCart: async (photoId: string, quantity: number = 1, options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<CartItem[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      
      // Get current cart
      const cartJson = await AsyncStorage.getItem(storageKey);
      const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
      
      // Check if item already exists
      const existingItemIndex = cart.findIndex(item => item.id === photoId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.push({ id: photoId, quantity });
      }
      
      // Save updated cart
      await AsyncStorage.setItem(storageKey, JSON.stringify(cart));
      
      return { data: cart, error: null, status: 200 };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Update item quantity in cart
   */
  updateQuantity: async (photoId: string, quantity: number, options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<CartItem[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      if (quantity <= 0) {
        return this.removeFromCart(photoId, options);
      }
      
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      
      // Get current cart
      const cartJson = await AsyncStorage.getItem(storageKey);
      const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
      
      // Find the item
      const existingItemIndex = cart.findIndex(item => item.id === photoId);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity = quantity;
        
        // Save updated cart
        await AsyncStorage.setItem(storageKey, JSON.stringify(cart));
      }
      
      return { data: cart, error: null, status: 200 };
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Remove item from cart
   */
  removeFromCart: async (photoId: string, options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<CartItem[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      
      // Get current cart
      const cartJson = await AsyncStorage.getItem(storageKey);
      const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
      
      // Filter out the item to remove
      const updatedCart = cart.filter(item => item.id !== photoId);
      
      // Save updated cart
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedCart));
      
      return { data: updatedCart, error: null, status: 200 };
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Clear entire cart
   */
  clearCart: async (options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<CartItem[]>> => {
    const { userId, isGuest = false } = options;
    
    try {
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      await AsyncStorage.removeItem(storageKey);
      return { data: [], error: null, status: 200 };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Get cart count (total items)
   */
  getCartCount: async (options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<number>> => {
    const { userId, isGuest = false } = options;
    
    try {
      const storageKey = isGuest ? GUEST_CART_KEY : `${USER_CART_PREFIX}${userId}`;
      
      const cartJson = await AsyncStorage.getItem(storageKey);
      const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];
      
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      
      return { data: count, error: null, status: 200 };
    } catch (error) {
      console.error('Error getting cart count:', error);
      return { data: 0, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Get cart total price
   */
  getCartTotal: async (options: {
    userId?: string;
    isGuest?: boolean;
  } = {}): Promise<ApiResponse<number>> => {
    try {
      const { data: cartItems } = await this.getCartItems(options);
      
      if (!cartItems) {
        return { data: 0, error: null, status: 200 };
      }
      
      const total = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      return { data: total, error: null, status: 200 };
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return { data: 0, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Transfer guest cart to user cart after login
   */
  transferGuestCart: async (userId: string): Promise<ApiResponse<null>> => {
    try {
      // Get guest cart
      const guestCartJson = await AsyncStorage.getItem(GUEST_CART_KEY);
      
      if (!guestCartJson) {
        return { data: null, error: null, status: 200 };
      }
      
      const guestCart: CartItem[] = JSON.parse(guestCartJson);
      
      if (guestCart.length === 0) {
        return { data: null, error: null, status: 200 };
      }
      
      // Get user cart
      const userCartKey = `${USER_CART_PREFIX}${userId}`;
      const userCartJson = await AsyncStorage.getItem(userCartKey);
      const userCart: CartItem[] = userCartJson ? JSON.parse(userCartJson) : [];
      
      // Merge carts
      const mergedCart = [...userCart];
      
      for (const guestItem of guestCart) {
        const existingItemIndex = mergedCart.findIndex(item => item.id === guestItem.id);
        
        if (existingItemIndex >= 0) {
          // Add quantities if item exists in both carts
          mergedCart[existingItemIndex].quantity += guestItem.quantity;
        } else {
          // Add new item from guest cart
          mergedCart.push(guestItem);
        }
      }
      
      // Save merged cart to user's cart
      await AsyncStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      
      // Clear guest cart
      await AsyncStorage.removeItem(GUEST_CART_KEY);
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Process checkout (placeholder)
   */
  checkout: async (
    paymentDetails: any,
    options: {
      userId?: string;
      isGuest?: boolean;
    } = {}
  ): Promise<ApiResponse<{ orderId: string }>> => {
    // This is a placeholder for checkout implementation
    // In a real app, you would:
    // 1. Verify cart items are available
    // 2. Process payment
    // 3. Create order records
    // 4. Clear the cart
    
    try {
      // Mock order creation
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Clear cart after successful order
      await this.clearCart(options);
      
      return { 
        data: { orderId }, 
        error: null, 
        status: 200 
      };
    } catch (error) {
      console.error('Error processing checkout:', error);
      return { 
        data: null, 
        error: error as Error, 
        status: 500 
      };
    }
  }
};