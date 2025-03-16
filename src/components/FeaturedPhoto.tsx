
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Tag, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Photo, useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className={cn("bg-card rounded-2xl overflow-hidden shadow-sm", className)}>
      <div 
        className={cn(
          "grid md:grid-cols-2 items-stretch",
          reversed ? "md:grid-flow-dense" : ""
        )}
      >
        {/* Photo */}
        <div className={cn("relative", !reversed ? "md:order-1" : "md:order-2")}>
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
              "w-full h-full object-cover transition-all duration-700",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )} 
            onLoad={() => setIsLoaded(true)}
          />
          
          {/* Featured badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
            <Award className="h-3.5 w-3.5" />
            Featured
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "p-6 md:p-8 flex flex-col justify-center", 
          !reversed ? "md:order-2" : "md:order-1"
        )}>
          <div className="space-y-4">
            <Badge variant="outline" className="mb-2">
              Premium Collection
            </Badge>
            
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight">
              {photo.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {photo.tags.map(tag => (
                <Link key={tag} to={`/gallery?tag=${tag}`}>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
            
            <p className="text-muted-foreground">
              {photo.description}
            </p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <span className="font-medium">By {photo.photographer}</span>
              <span>•</span>
              <span>{photo.location}</span>
            </div>
            
            <div className="pt-2">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">
                  ${photo.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Standard license
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                
                <Link to={`/photo/${photo.id}`}>
                  <Button variant="outline" size="lg" className="flex items-center gap-2">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPhoto;
