
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'navbar';
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Expanded suggested searches to be more like Getty Images
  const suggestions = [
    'Steam locomotives',
    'Mountain railways',
    'Urban transit',
    'Vintage trains',
    'Railway stations',
    'Freight trains',
    'Subway trains',
    'High-speed trains',
    'Railway bridges',
    'Train interiors',
    'Railroad workers',
    'Train at sunset',
  ];

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    // For now we'll just redirect to gallery with future search implementation
    navigate('/gallery');
    setOpen(false);
  };

  return (
    <>
      {variant === 'navbar' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={cn(
            "w-full md:w-64 justify-start text-sm text-muted-foreground",
            className
          )}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search train photos...</span>
        </Button>
      ) : (
        <div className={cn("relative w-full max-w-xl mx-auto", className)}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              onClick={() => setOpen(true)}
              placeholder="Search for train photos..."
              readOnly
              className="pl-10 h-12 bg-background cursor-pointer"
            />
          </div>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search train photos..." 
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion) => (
              <CommandItem 
                key={suggestion}
                onSelect={() => {
                  handleSearch(suggestion);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                {suggestion}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;
