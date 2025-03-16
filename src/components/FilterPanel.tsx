
import React from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';

export type PhotoFilters = {
  tags: string[];
  photographers: string[];
  locations: string[];
  priceRange: [number, number];
  orientation?: 'landscape' | 'portrait' | undefined;
  sortBy: 'newest' | 'popular' | 'price_high' | 'price_low';
}

type FilterPanelProps = {
  filters: PhotoFilters;
  setFilters: React.Dispatch<React.SetStateAction<PhotoFilters>>;
  allTags: string[];
  allPhotographers: string[];
  allLocations: string[];
  minPrice: number;
  maxPrice: number;
  totalPhotos: number;
  displayPhotos: number;
  onClearFilters: () => void;
  isOpen: boolean;
}

const FilterPanel = ({
  filters,
  setFilters,
  allTags,
  allPhotographers,
  allLocations,
  minPrice,
  maxPrice,
  totalPhotos,
  displayPhotos,
  onClearFilters,
  isOpen
}: FilterPanelProps) => {
  
  // Update a specific filter value
  const updateFilter = <K extends keyof PhotoFilters>(key: K, value: PhotoFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Toggle a tag filter
  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };
  
  // Toggle a photographer filter
  const togglePhotographer = (photographer: string) => {
    const newPhotographers = filters.photographers.includes(photographer)
      ? filters.photographers.filter(p => p !== photographer)
      : [...filters.photographers, photographer];
    updateFilter('photographers', newPhotographers);
  };
  
  // Toggle a location filter
  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    updateFilter('locations', newLocations);
  };

  // Conditionally render clear filters button
  const hasActiveFilters = 
    filters.tags.length > 0 || 
    filters.photographers.length > 0 || 
    filters.locations.length > 0 || 
    filters.priceRange[0] > minPrice ||
    filters.priceRange[1] < maxPrice ||
    filters.orientation !== undefined;
  
  // Format price for display
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  return (
    <div className={cn(
      "bg-background transition-all duration-300 overflow-hidden border rounded-lg",
      isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
    )}>
      <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-sm"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear all
            </Button>
          )}
        </div>
      
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="text-sm text-muted-foreground pb-2 border-b">
            Showing {displayPhotos} of {totalPhotos} photos
          </div>
          
          {/* Sort options */}
          <div className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Sort by</Label>
            </div>
            <Select 
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value as PhotoFilters['sortBy'])}
            >
              <SelectTrigger className="mt-1.5 h-9">
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price_high">Price: High to low</SelectItem>
                <SelectItem value="price_low">Price: Low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Image Orientation */}
          <div className="pb-3 border-b">
            <Label className="text-sm font-medium mb-2 block">Orientation</Label>
            <ToggleGroup 
              type="single" 
              value={filters.orientation || ""}
              onValueChange={(value) => {
                updateFilter('orientation', value === "" ? undefined : value as 'landscape' | 'portrait');
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="" aria-label="All orientations">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="landscape" aria-label="Landscape photos">
                Landscape
              </ToggleGroupItem>
              <ToggleGroupItem value="portrait" aria-label="Portrait photos">
                Portrait
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* Price Range Slider */}
          <Accordion type="single" collapsible defaultValue="price">
            <AccordionItem value="price" className="border-b">
              <AccordionTrigger className="text-sm font-medium py-2">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm">{formatPrice(filters.priceRange[0])}</span>
                    <span className="text-sm">{formatPrice(filters.priceRange[1])}</span>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    className="my-4"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Tag Filters */}
          <Accordion type="single" collapsible defaultValue="tags">
            <AccordionItem value="tags" className="border-b">
              <AccordionTrigger className="text-sm font-medium py-2">
                Tags
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1 pb-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag}`} 
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Photographer Filters */}
          <Accordion type="single" collapsible>
            <AccordionItem value="photographers" className="border-b">
              <AccordionTrigger className="text-sm font-medium py-2">
                Photographers
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1 pb-2">
                  {allPhotographers.map((photographer) => (
                    <div key={photographer} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`photographer-${photographer}`} 
                        checked={filters.photographers.includes(photographer)}
                        onCheckedChange={() => togglePhotographer(photographer)}
                      />
                      <Label 
                        htmlFor={`photographer-${photographer}`} 
                        className="text-sm cursor-pointer"
                      >
                        {photographer}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Location Filters */}
          <Accordion type="single" collapsible>
            <AccordionItem value="locations" className="border-b">
              <AccordionTrigger className="text-sm font-medium py-2">
                Locations
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1 pb-2">
                  {allLocations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`location-${location}`} 
                        checked={filters.locations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                      />
                      <Label 
                        htmlFor={`location-${location}`} 
                        className="text-sm cursor-pointer"
                      >
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
