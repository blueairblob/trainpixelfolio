
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Photo, useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface FeaturedPhotoProps {
  photo: Photo;
  className?: string;
  reversed?: boolean;
}

const FeaturedPhoto: React.FC<FeaturedPhotoProps> = ({ 
  photo, 
  className = '',
  reversed = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(photo);
  };

  return (
    <div 
      className={cn(
        "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
        reversed ? "md:grid-flow-dense" : "",
        className
      )}
    >
      {/* Photo */}
      <div className={cn("relative rounded-2xl overflow-hidden", !reversed ? "md:order-1" : "md:order-2")}>
        {/* Blurred placeholder */}
        <div 
          className={cn(
            "absolute inset-0 bg-muted backdrop-blur-md transition-opacity duration-700",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
        
        <img 
          src={photo.imageUrl}
          alt={photo.title}
          loading="eager"
          className={cn(
            "w-full aspect-[4/3] object-cover transition-all duration-700",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )} 
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Image info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-2">
            Featured
          </div>
          <h3 className="text-lg md:text-xl font-medium">{photo.title}</h3>
          <p className="text-xs md:text-sm text-white/80 mt-1">{photo.photographer} · {photo.location}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className={cn(!reversed ? "md:order-2" : "md:order-1")}>
        <div className="space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium">
            Featured Collection
          </span>
          
          <h2 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight">
            {photo.title}
          </h2>
          
          <p className="text-muted-foreground">
            {photo.description}
          </p>
          
          <div className="pt-2">
            <span className="block text-lg font-medium mb-4">
              ${photo.price.toFixed(2)}
            </span>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleAddToCart}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              
              <Link to={`/photo/${photo.id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPhoto;
