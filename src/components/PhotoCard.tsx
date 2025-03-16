
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Heart, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Photo, useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        "group block relative rounded-xl overflow-hidden bg-muted transition-all duration-300 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
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
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/40 text-white backdrop-blur-sm">
            {photo.tags[0]}
          </span>
        </div>
        
        {/* Action buttons overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 transition-opacity duration-300 flex flex-col justify-between p-3", 
            isHovered && "opacity-100"
          )}
        >
          {/* Top buttons row */}
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="size-8 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  >
                    <Heart className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save to favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Bottom info */}
          <div>
            <h3 className="text-sm font-medium text-white line-clamp-1">
              {photo.title}
            </h3>
            <p className="text-xs text-white/80">{photo.photographer}</p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium text-white">
                ${photo.price.toFixed(2)}
              </span>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 rounded-full flex items-center gap-1 text-xs bg-white text-primary hover:bg-white/90"
                >
                  <PlusCircle className="size-3.5" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PhotoCard;
