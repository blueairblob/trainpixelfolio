// CartScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const CartScreen = ({ navigation }) => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  const { isGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle removing an item from the cart
  const handleRemoveItem = (id: string) => {
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
          onPress: () => removeFromCart(id)
        }
      ]
    );
  };
  
  // Handle updating an item's quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };
  
  // Handle cart clearing
  const handleClearCart = () => {
    if (items.length === 0) return;
    
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => clearCart()
        }
      ]
    );
  };
  
  // Handle checkout process
  const handleCheckout = () => {
    if (isGuest) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to complete your purchase.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Sign In", 
            onPress: () => navigation.navigate('Profile')
          }
        ]
      );
      return;
    }
    
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      Alert.alert(
        "Order Completed",
        "Your order has been successfully processed! You will receive an email with your download links.",
        [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              navigation.navigate('Home');
            }
          }
        ]
      );
    }, 2000);
  };
  
  // Calculate tax and total
  const taxAmount = totalPrice * 0.08; // 8% tax rate
  const orderTotal = totalPrice + taxAmount;
  
  // Safe toFixed function that handles undefined prices
  const safeToFixed = (value, digits = 2) => {
    if (value === undefined || value === null) {
      return "0.00";
    }
    return value.toFixed(digits);
  };
  
  // Render cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PhotoDetailScreen', { id: item.id })}
      >
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.itemDetails}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PhotoDetailScreen', { id: item.id })}
        >
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title || 'Untitled Photo'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.itemPhotographer}>
          {item.photographer || 'Unknown photographer'}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>£{safeToFixed(item.price || 0.50)}</Text>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                if (item.quantity > 1) {
                  handleUpdateQuantity(item.id, item.quantity - 1);
                } else {
                  handleRemoveItem(item.id);
                }
              }}
            >
              <Ionicons name="remove" size={16} color="#4b5563" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.itemTotal}>
          Total: £{safeToFixed((item.price || 0.50) * item.quantity)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {items.length > 0 ? (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</Text>
              <Text style={styles.summaryValue}>£{safeToFixed(totalPrice)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>£{safeToFixed(taxAmount)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                £{safeToFixed(orderTotal)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (isProcessingPayment || isGuest) && styles.checkoutButtonDisabled
              ]}
              onPress={handleCheckout}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" style={styles.checkoutButtonIcon} />
                  <Text style={styles.checkoutButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>
                    {isGuest ? 'Sign In to Checkout' : 'Proceed to Checkout'}
                  </Text>
                  <Ionicons 
                    name={isGuest ? 'log-in-outline' : 'arrow-forward'} 
                    size={16} 
                    color="#ffffff" 
                    style={styles.checkoutButtonIcon} 
                  />
                </>
              )}
            </TouchableOpacity>
            
            {isGuest && (
              <Text style={styles.guestMessage}>
                You're browsing as a guest. Sign in to complete your purchase.
              </Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartMessage}>
            Add some beautiful train photos to your cart
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Text style={styles.browseButtonText}>Browse Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemPhotographer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  checkoutButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButtonIcon: {
    marginLeft: 8,
  },
  guestMessage: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;