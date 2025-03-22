
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import FilterPanel from '@/components/FilterPanel';
import PhotoGrid from '@/components/PhotoGrid';
import FilterBar from '@/components/FilterBar';
import { usePhotoFilters } from '@/hooks/usePhotoFilters';
import { allPhotos, extractMetadata, hasActiveFilters, countActiveFilters } from '@/services/photoService.ts'; // Change .js to .ts

const Gallery = () => {
  const { tags, photographers, locations, minPrice, maxPrice } = extractMetadata();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { 
    filters, 
    setFilters, 
    displayPhotos, 
    clearFilters,
    setSortBy
  } = usePhotoFilters({
    allPhotos,
    minPrice,
    maxPrice
  });
  
  // Check if any filters are active
  const activeFilters = hasActiveFilters(filters, minPrice, maxPrice);
  const activeFilterCount = countActiveFilters(filters, minPrice, maxPrice);

  // Handle sort change
  const handleSortChange = (sortBy: 'newest' | 'popular' | 'price_high' | 'price_low') => {
    setSortBy(sortBy);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 md:pb-20">
        <div className="container px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-medium tracking-tight">
              Train Photography Gallery
            </h1>
            <p className="mt-4 text-muted-foreground">
              Browse our collection of premium train photographs from around the world.
            </p>
          </div>
        </div>
      </section>
      
      {/* Gallery */}
      <section>
        <div className="container px-6">
          {/* Filter bar */}
          <FilterBar 
            toggleFilterMenu={() => setShowFilterMenu(!showFilterMenu)}
            hasActiveFilters={activeFilters}
            clearFilters={clearFilters}
            displayCount={displayPhotos.length}
            sortBy={filters.sortBy}
            onSortChange={handleSortChange}
          />
          
          {/* Filter component */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            allTags={tags}
            allPhotographers={photographers}
            allLocations={locations}
            minPrice={minPrice}
            maxPrice={maxPrice}
            totalPhotos={allPhotos.length}
            displayPhotos={displayPhotos.length}
            onClearFilters={clearFilters}
            isOpen={showFilterMenu}
          />
          
          {/* Photos grid */}
          <PhotoGrid 
            photos={displayPhotos} 
            clearFilters={clearFilters} 
          />
        </div>
      </section>
    </div>
  );
};

export default Gallery;
