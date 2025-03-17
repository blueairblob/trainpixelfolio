
import { useState, useEffect } from 'react';
import { Photo } from '@/context/CartContext';
import { PhotoFilters } from '@/components/FilterPanel';
import { filterPhotos } from '@/services/photoService';

interface UsePhotoFiltersProps {
  allPhotos: Photo[];
  minPrice: number;
  maxPrice: number;
}

interface UsePhotoFiltersReturn {
  filters: PhotoFilters;
  setFilters: React.Dispatch<React.SetStateAction<PhotoFilters>>;
  displayPhotos: Photo[];
  clearFilters: () => void;
  setSortBy: (sortBy: 'newest' | 'popular' | 'price_high' | 'price_low') => void;
}

export const usePhotoFilters = ({
  allPhotos,
  minPrice,
  maxPrice
}: UsePhotoFiltersProps): UsePhotoFiltersReturn => {
  const [filters, setFilters] = useState<PhotoFilters>({
    tags: [],
    photographers: [],
    locations: [],
    priceRange: [minPrice, maxPrice],
    orientation: undefined,
    sortBy: 'newest'
  });
  
  const [displayPhotos, setDisplayPhotos] = useState<Photo[]>(allPhotos);
  
  // Apply filters when they change
  useEffect(() => {
    const filtered = filterPhotos(allPhotos, filters);
    setDisplayPhotos(filtered);
  }, [filters, allPhotos]);
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      tags: [],
      photographers: [],
      locations: [],
      priceRange: [minPrice, maxPrice],
      orientation: undefined,
      sortBy: filters.sortBy // Keep the current sort option
    });
  };
  
  // Set sort by option
  const setSortBy = (sortBy: 'newest' | 'popular' | 'price_high' | 'price_low') => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };
  
  return {
    filters,
    setFilters,
    displayPhotos,
    clearFilters,
    setSortBy
  };
};
