
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Photo, useCart } from '@/context/CartContext';

interface PhotoCardProps {
  photo: Photo;
  className?: string;
  priority?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo,
  className,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(photo);
  };

  return (
    <Link 
      to={`/photo/${photo.id}`}
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-muted transition-all duration-300 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] w-full relative overflow-hidden">
        {/* Blurred placeholder */}
        <div 
          className={cn(
            "absolute inset-0 bg-muted backdrop-blur-md transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Actual image */}
        <img
          src={photo.imageUrl}
          alt={photo.title}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Overlay on hover */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300", 
            isHovered && "opacity-100"
          )}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-base line-clamp-1">{photo.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{photo.photographer}</p>
          </div>
          <div className="font-medium">
            ${photo.price.toFixed(2)}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{photo.location}</p>
          <button
            onClick={handleAddToCart}
            className={cn(
              "text-xs flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 transition-all",
              "hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PhotoCard;
