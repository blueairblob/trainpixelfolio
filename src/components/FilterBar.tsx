
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  toggleFilterMenu: () => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  displayCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  toggleFilterMenu, 
  hasActiveFilters, 
  clearFilters, 
  displayCount 
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={toggleFilterMenu}
        >
          <Filter className="size-4" />
          Filters {hasActiveFilters && `(${displayCount})`}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {displayCount} {displayCount === 1 ? 'photo' : 'photos'}
      </div>
    </div>
  );
};

export default FilterBar;
