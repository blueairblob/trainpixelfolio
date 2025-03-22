
import { useState, useEffect } from 'react';
import { Photo as CartPhoto } from '@/context/CartContext';
import { Photo as ServicePhoto, PhotoFilters } from '@/services/photoService';
import { filterPhotos } from '@/services/photoService'; // Change .js to .ts

interface UsePhotoFiltersProps {
  allPhotos: CartPhoto[] | ServicePhoto[];
  minPrice: number;
  maxPrice: number;
}

interface UsePhotoFiltersReturn {
  filters: PhotoFilters;
  setFilters: React.Dispatch<React.SetStateAction<PhotoFilters>>;
  displayPhotos: CartPhoto[] | ServicePhoto[];
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
  
  const [displayPhotos, setDisplayPhotos] = useState<CartPhoto[] | ServicePhoto[]>(allPhotos);
  
  // Apply filters when they change
  useEffect(() => {
    // Need to cast to ServicePhoto[] since filterPhotos expects that type
    const servicePhotos = allPhotos as ServicePhoto[];
    const filtered = filterPhotos(servicePhotos, filters);
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
