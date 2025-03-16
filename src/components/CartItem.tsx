
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { AnimatedNumber } from '@/utils/animations';

interface CartItemProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  photographer: string;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  title,
  price,
  imageUrl,
  quantity,
  photographer
}) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const increaseQuantity = () => {
    updateQuantity(id, quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeFromCart(id);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border animate-fade-in">
      {/* Image */}
      <Link to={`/photo/${id}`} className="shrink-0 rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-20 h-20 object-cover hover:scale-105 transition-transform"
        />
      </Link>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/photo/${id}`} className="hover:underline">
          <h3 className="font-medium truncate">{title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{photographer}</p>
        
        {/* Price x Quantity */}
        <div className="mt-1 text-sm">
          ${price.toFixed(2)} x {quantity} = 
          <span className="font-medium ml-1">
            $<AnimatedNumber value={price * quantity} formatValue={(val) => val.toFixed(2)} />
          </span>
        </div>
      </div>
      
      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={decreaseQuantity}
          className={cn(
            "size-8 rounded flex items-center justify-center transition-colors",
            "bg-secondary hover:bg-secondary/80"
          )}
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </button>
        
        <span className="w-6 text-center">{quantity}</span>
        
        <button
          onClick={increaseQuantity}
          className={cn(
            "size-8 rounded flex items-center justify-center transition-colors",
            "bg-secondary hover:bg-secondary/80"
          )}
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      
      {/* Remove button */}
      <button
        onClick={() => removeFromCart(id)}
        className="text-muted-foreground hover:text-destructive transition-colors p-2"
        aria-label="Remove item"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};

export default CartItem;
