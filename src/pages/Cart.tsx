
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import CartItem from '@/components/CartItem';
import { useCart } from '@/context/CartContext';
import { AnimatedNumber, StaggerChildren } from '@/utils/animations';
import { toast } from 'sonner';

const Cart = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  
  const handleCheckout = () => {
    toast.success("This is a demo. In a real app, you would be redirected to checkout.");
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container px-6 pt-32">
        <h1 className="text-3xl font-medium tracking-tight flex items-center gap-3">
          <ShoppingCart className="h-7 w-7" />
          Shopping Cart
          {totalItems > 0 && <span className="text-muted-foreground">({totalItems})</span>}
        </h1>
        
        <Separator className="my-6" />
        
        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div>
                <StaggerChildren>
                  {items.map(item => (
                    <CartItem 
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      quantity={item.quantity}
                      photographer={item.photographer}
                    />
                  ))}
                </StaggerChildren>
                
                <div className="mt-6 text-right">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    size="sm"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order summary */}
            <div>
              <div className="bg-card rounded-xl border p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>
                      $<AnimatedNumber 
                        value={totalPrice + (totalPrice * 0.08)} 
                        formatValue={(val) => val.toFixed(2)}
                      />
                    </span>
                  </div>
                </div>
                
                <Button
                  className="w-full mt-6 flex items-center gap-2"
                  onClick={handleCheckout}
                >
                  <CreditCard className="h-4 w-4" />
                  Checkout
                </Button>
                
                <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    This is a demo application. No actual purchase will be made.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any photos to your cart yet.
              </p>
              <Link to="/gallery">
                <Button className="flex items-center gap-2">
                  Browse Gallery
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
