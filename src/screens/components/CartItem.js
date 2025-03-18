
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = ({ item, navigation, onRemove, onUpdateQuantity }) => {
  return (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PhotoDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.itemDetails}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PhotoDetail', { id: item.id })}
        >
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        </TouchableOpacity>
        <Text style={styles.itemPhotographer}>{item.photographer}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                if (item.quantity > 1) {
                  onUpdateQuantity(item.id, item.quantity - 1);
                } else {
                  onRemove(item.id);
                }
              }}
            >
              <Ionicons name="remove" size={16} color="#4b5563" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.itemTotal}>
          Total: ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CartItem;
