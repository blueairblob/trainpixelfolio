
import { Photo } from '@/context/CartContext';
import { PhotoFilters } from '@/components/FilterPanel';

// Sample gallery data
export const allPhotos: Photo[] = [
  {
    id: "train-1",
    title: "Mountain Express at Sunset",
    description: "A stunning mountain railway scene with a vintage train passing through alpine scenery as the sun sets in the background, creating a golden glow over the landscape.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80",
    photographer: "Thomas Railway",
    location: "Swiss Alps",
    tags: ["mountains", "sunset", "vintage"]
  },
  {
    id: "train-2",
    title: "Urban Transit",
    description: "A modern high-speed train cutting through an urban landscape, showcasing the contrast between sleek modern engineering and the cityscape backdrop.",
    price: 59.99,
    imageUrl: "https://images.unsplash.com/photo-1679679008383-6f778fe07382?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Metro Visuals",
    location: "Tokyo, Japan",
    tags: ["urban", "modern", "speed"]
  },
  {
    id: "train-3",
    title: "Steam Through the Forest",
    description: "Heritage steam locomotive traveling through dense pine forest.",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    photographer: "Heritage Rails",
    location: "Black Forest, Germany",
    tags: ["steam", "forest", "vintage"]
  },
  {
    id: "train-4",
    title: "Station Waiting",
    description: "Empty vintage train station early in the morning.",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1609618996942-44532fa2e24d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Station Stories",
    location: "York, England",
    tags: ["station", "vintage", "architecture"]
  },
  {
    id: "train-5",
    title: "Subway Motion",
    description: "Long exposure shot of subway train in motion.",
    price: 54.99,
    imageUrl: "https://images.unsplash.com/photo-1515165362412-4cebd8bb6174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Urban Shutter",
    location: "New York City, USA",
    tags: ["subway", "motion", "urban"]
  },
  {
    id: "train-6",
    title: "Coastal Line",
    description: "Passenger train running along scenic coastal track.",
    price: 64.99,
    imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    photographer: "Coastal Captures",
    location: "California Coast, USA",
    tags: ["coastal", "scenic", "passenger"]
  },
  {
    id: "train-7",
    title: "Industrial Yard",
    description: "Freight trains in an industrial railway yard at dusk.",
    price: 44.99,
    imageUrl: "https://images.unsplash.com/photo-1553576900-9c8bec2bbef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Industrial Eye",
    location: "Rotterdam, Netherlands",
    tags: ["industrial", "freight", "dusk"]
  },
  {
    id: "train-8",
    title: "Morning Commute",
    description: "Early morning commuter train with city skyline.",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1673175032354-1c4c96427946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Daily Transit",
    location: "Chicago, USA",
    tags: ["commuter", "morning", "city"]
  },
  {
    id: "train-9",
    title: "Snow Journey",
    description: "Train cutting through heavy snow in mountain pass.",
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1518458476302-cee643d3aa5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Winter Rails",
    location: "Norwegian Mountains",
    tags: ["snow", "winter", "mountains"]
  }
];

// Extract unique metadata values
export const extractMetadata = () => {
  const tags = Array.from(new Set(allPhotos.flatMap(photo => photo.tags)));
  const photographers = Array.from(new Set(allPhotos.map(photo => photo.photographer)));
  const locations = Array.from(new Set(allPhotos.map(photo => photo.location)));
  const prices = allPhotos.map(photo => photo.price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));
  
  return { tags, photographers, locations, minPrice, maxPrice };
};

// Apply filters to photos
export const filterPhotos = (photos: Photo[], filters: PhotoFilters): Photo[] => {
  let filtered = [...photos];
  
  // Filter by tags
  if (filters.tags.length > 0) {
    filtered = filtered.filter(photo => 
      photo.tags.some(tag => filters.tags.includes(tag))
    );
  }
  
  // Filter by photographers
  if (filters.photographers.length > 0) {
    filtered = filtered.filter(photo => 
      filters.photographers.includes(photo.photographer)
    );
  }
  
  // Filter by locations
  if (filters.locations.length > 0) {
    filtered = filtered.filter(photo => 
      filters.locations.includes(photo.location)
    );
  }
  
  // Filter by price range
  filtered = filtered.filter(photo => 
    photo.price >= filters.priceRange[0] && photo.price <= filters.priceRange[1]
  );
  
  // Filter by orientation (simulated)
  if (filters.orientation) {
    // In a real app, you would filter based on actual image dimensions
    // For this example, we're simulating by filtering even/odd IDs
    const isLandscape = filters.orientation === 'landscape';
    filtered = filtered.filter(photo => {
      const id = parseInt(photo.id.split('-')[1]);
      return isLandscape ? id % 2 === 0 : id % 2 !== 0;
    });
  }
  
  // Apply sorting
  switch (filters.sortBy) {
    case 'newest':
      // Simulate sorting by newest (reverse order of IDs)
      filtered = [...filtered].sort((a, b) => {
        const idA = parseInt(a.id.split('-')[1]);
        const idB = parseInt(b.id.split('-')[1]);
        return idB - idA;
      });
      break;
    case 'popular':
      // Simulate sorting by popularity (random sort for this example)
      filtered = [...filtered].sort(() => Math.random() - 0.5);
      break;
    case 'price_high':
      filtered = [...filtered].sort((a, b) => b.price - a.price);
      break;
    case 'price_low':
      filtered = [...filtered].sort((a, b) => a.price - b.price);
      break;
  }
  
  return filtered;
};

// Helper to count active filters
export const countActiveFilters = (
  filters: PhotoFilters, 
  minPrice: number, 
  maxPrice: number
): number => {
  return filters.tags.length + 
    filters.photographers.length + 
    filters.locations.length + 
    (filters.orientation ? 1 : 0) +
    ((filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice) ? 1 : 0);
};

// Check if there are any active filters
export const hasActiveFilters = (
  filters: PhotoFilters, 
  minPrice: number, 
  maxPrice: number
): boolean => {
  return filters.tags.length > 0 || 
    filters.photographers.length > 0 || 
    filters.locations.length > 0 || 
    filters.priceRange[0] > minPrice ||
    filters.priceRange[1] < maxPrice ||
    filters.orientation !== undefined;
};
