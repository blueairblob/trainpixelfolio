
import React from 'react';
import { Filter, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterBarProps {
  toggleFilterMenu: () => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  displayCount: number;
  sortBy: string;
  onSortChange: (value: 'newest' | 'popular' | 'price_high' | 'price_low') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  toggleFilterMenu, 
  hasActiveFilters, 
  clearFilters, 
  displayCount,
  sortBy,
  onSortChange
}) => {
  // Array of sorting options
  const sortOptions = [
    { value: 'newest' as const, label: 'Newest' },
    { value: 'popular' as const, label: 'Most Popular' },
    { value: 'price_high' as const, label: 'Price: High to Low' },
    { value: 'price_low' as const, label: 'Price: Low to High' },
  ];

  // Find the current sort option label
  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Newest';

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
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <ArrowDownUp className="size-4" />
              Sort: {currentSortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={sortBy === option.value ? "bg-muted" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="text-sm text-muted-foreground">
          Showing {displayCount} {displayCount === 1 ? 'photo' : 'photos'}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
