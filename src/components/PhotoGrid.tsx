
import React from 'react';
import { Photo } from '@/context/CartContext';
import PhotoCard from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { StaggerChildren } from '@/utils/animations';

interface PhotoGridProps {
  photos: Photo[];
  clearFilters: () => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, clearFilters }) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium mb-2">No photos match your filters</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your filter selection</p>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <StaggerChildren>
        {photos.map((photo, index) => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            priority={index < 6}
          />
        ))}
      </StaggerChildren>
    </div>
  );
};

export default PhotoGrid;
