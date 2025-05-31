// src/context/CartContext.tsx - Updated with feature flags
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES, canShowCart, canShowPricing } from '@/config/features';

export interface CartItem {
  id: string;
  title: string;
  photographer: string;
  price: number;
  imageUrl: string;
  thumbnailUrl?: string;
  location: string;
  description: string;
  quantity: number;
}

interface CartContextType {
  // Cart state
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  
  // Cart methods (may be disabled by feature flags)
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Feature availability
  isCartEnabled: boolean;
  isPricingEnabled: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'picaloco_cart';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feature availability flags
  const isCartEnabled = canShowCart();
  const isPricingEnabled = canShowPricing();
  
  // Computed values
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = isPricingEnabled 
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    // Save cart whenever items change (but only if cart is enabled)
    if (isCartEnabled) {
      saveCart();
    }
  }, [items, isCartEnabled]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      
      // If cart is disabled, don't load anything
      if (!isCartEnabled) {
        setItems([]);
        return;
      }
      
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedItems: CartItem[] = JSON.parse(cartData);
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      if (!isCartEnabled) {
        // If cart is disabled, clear stored cart data
        await AsyncStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    if (!isCartEnabled) {
      console.log('Cart functionality is disabled');
      return;
    }
    
    setItems(currentItems => {
      const existingItem = currentItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Item already exists, increase quantity
        return currentItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          ...item,
          quantity: 1,
          price: isPricingEnabled ? item.price : 0 // Set price to 0 if pricing is disabled
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    if (!isCartEnabled) {
      console.log('Cart functionality is disabled');
      return;
    }
    
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!isCartEnabled) {
      console.log('Cart functionality is disabled');
      return;
    }
    
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    if (!isCartEnabled) {
      console.log('Cart functionality is disabled');
      return;
    }
    
    setItems([]);
  };

  // If cart is disabled, provide empty/disabled implementations
  const disabledAddToCart = () => {
    console.log('Cart functionality is disabled');
  };

  const disabledRemoveFromCart = () => {
    console.log('Cart functionality is disabled');
  };

  const disabledUpdateQuantity = () => {
    console.log('Cart functionality is disabled');
  };

  const disabledClearCart = () => {
    console.log('Cart functionality is disabled');
  };

  const value: CartContextType = {
    items: isCartEnabled ? items : [],
    totalItems: isCartEnabled ? totalItems : 0,
    totalPrice: isCartEnabled && isPricingEnabled ? totalPrice : 0,
    isLoading,
    addToCart: isCartEnabled ? addToCart : disabledAddToCart,
    removeFromCart: isCartEnabled ? removeFromCart : disabledRemoveFromCart,
    updateQuantity: isCartEnabled ? updateQuantity : disabledUpdateQuantity,
    clearCart: isCartEnabled ? clearCart : disabledClearCart,
    isCartEnabled,
    isPricingEnabled,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};