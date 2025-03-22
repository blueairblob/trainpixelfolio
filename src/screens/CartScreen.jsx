
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { getCartItems } from '../services/cartService';

// Import our new components
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import EmptyCart from './components/EmptyCart';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart items
  useEffect(() => {
    const loadCartItems = async () => {
      setIsLoading(true);
      try {
        const items = await getCartItems();
        setCartItems(items);
      } catch (error) {
        console.error('Error loading cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleRemoveItem = (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            // In a real app, this would call removeFromCart from CartContext
            const updatedItems = cartItems.filter(item => item.id !== id);
            setCartItems(updatedItems);
          }
        }
      ]
    );
  };
  
  const handleUpdateQuantity = (id, newQuantity) => {
    // In a real app, this would call updateQuantity from CartContext
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
  };
  
  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "This would proceed to payment in a real app.",
      [{ text: "OK" }]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => setCartItems([])
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={({ item }) => (
              <CartItem 
                item={item} 
                navigation={navigation}
                onRemove={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
          />
          
          <CartSummary 
            totalPrice={totalPrice}
            onCheckout={handleCheckout}
          />
        </>
      ) : (
        <EmptyCart 
          onBrowse={() => navigation.navigate('Gallery')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  clearCartText: {
    fontSize: 14,
    color: '#dc2626',
  },
  cartList: {
    padding: 16,
  },
});

export default CartScreen;
