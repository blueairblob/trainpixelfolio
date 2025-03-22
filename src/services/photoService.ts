// Photo data model
export interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  price: number;
  photographer: string;
  location: string;
  dateTaken: string;
  camera: string;
  resolution: string;
  tags: string[];
  popularity: number;
}

// Sample data for the app
export const allPhotos: Photo[] = [
  {
    id: 'photo1',
    title: 'Steam Locomotive at Sunset',
    description: 'A vintage steam locomotive traveling through a mountain pass at sunset.',
    imageUrl: 'https://images.unsplash.com/photo-1527084010126-2a48931d701e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1527084010126-2a48931d701e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    price: 49.99,
    photographer: 'Thomas Rails',
    location: 'Rocky Mountains, Colorado',
    dateTaken: '2022-06-15',
    camera: 'Canon EOS 5D Mark IV',
    resolution: '5760 x 3840',
    tags: ['steam', 'sunset', 'mountains'],
    popularity: 94
  },
  {
    id: 'photo2',
    title: 'Modern High-Speed Train',
    description: 'A sleek high-speed passenger train zooming through a rural landscape.',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    price: 39.99,
    photographer: 'Emma Tracks',
    location: 'Countryside, Japan',
    dateTaken: '2023-01-22',
    camera: 'Sony Alpha A7 III',
    resolution: '6000 x 4000',
    tags: ['modern', 'high-speed', 'rural'],
    popularity: 88
  },
  {
    id: 'photo3',
    title: 'Historic Railway Station',
    description: 'Interior view of a grand 19th century railway station with ornate architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1530793740-c7d0855c949a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530793740-c7d0855c949a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    price: 54.99,
    photographer: 'Michael Stations',
    location: 'Grand Central, New York',
    dateTaken: '2021-11-05',
    camera: 'Nikon D850',
    resolution: '8256 x 5504',
    tags: ['stations', 'historic', 'architecture'],
    popularity: 92
  },
  {
    id: 'photo4',
    title: 'Mountain Railway Journey',
    description: 'A scenic railway winding through alpine mountains covered with snow.',
    imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    price: 59.99,
    photographer: 'Sarah Alpine',
    location: 'Swiss Alps, Switzerland',
    dateTaken: '2022-02-18',
    camera: 'Canon EOS R5',
    resolution: '8192 x 5464',
    tags: ['scenic', 'mountains', 'snow'],
    popularity: 96
  },
  {
    id: 'photo5',
    title: 'Night Train Departure',
    description: 'A passenger train illuminated at night, ready for departure from the platform.',
    imageUrl: 'https://images.unsplash.com/photo-1474302694023-9711af8045cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1474302694023-9711af8045cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    price: 44.99,
    photographer: 'James Nightrail',
    location: 'Berlin Central Station, Germany',
    dateTaken: '2023-03-30',
    camera: 'Sony Alpha A9 II',
    resolution: '6000 x 4000',
    tags: ['modern', 'night', 'stations'],
    popularity: 86
  }
];

// Service functions
export const getAllPhotos = async (): Promise<Photo[]> => {
  // Simulating API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allPhotos);
    }, 500);
  });
};

export const getPhotoById = (id: string): Photo | undefined => {
  return allPhotos.find(photo => photo.id === id);
};

export const getPhotosByCategory = (category: string): Photo[] => {
  if (category === 'all') return allPhotos;
  return allPhotos.filter(photo => photo.tags.includes(category));
};

// Extract metadata for filters
export const extractMetadata = () => {
  const tags = Array.from(new Set(allPhotos.flatMap(photo => photo.tags)));
  const photographers = Array.from(new Set(allPhotos.map(photo => photo.photographer)));
  const locations = Array.from(new Set(allPhotos.map(photo => photo.location)));
  const prices = allPhotos.map(photo => photo.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return { tags, photographers, locations, minPrice, maxPrice };
};

// Filter helper functions
export interface PhotoFilters {
  tags: string[];
  photographers: string[];
  locations: string[];
  priceRange: [number, number];
  orientation?: 'landscape' | 'portrait' | undefined;
  sortBy: 'newest' | 'popular' | 'price_high' | 'price_low';
}

export const hasActiveFilters = (
  filters: PhotoFilters, 
  defaultMinPrice: number, 
  defaultMaxPrice: number
): boolean => {
  const { tags, photographers, locations, priceRange } = filters;
  
  return (
    tags.length > 0 || 
    photographers.length > 0 || 
    locations.length > 0 || 
    priceRange[0] > defaultMinPrice || 
    priceRange[1] < defaultMaxPrice
  );
};

export const countActiveFilters = (
  filters: PhotoFilters, 
  defaultMinPrice: number, 
  defaultMaxPrice: number
): number => {
  const { tags, photographers, locations, priceRange } = filters;
  
  let count = 0;
  if (tags.length > 0) count += 1;
  if (photographers.length > 0) count += 1;
  if (locations.length > 0) count += 1;
  if (priceRange[0] > defaultMinPrice || priceRange[1] < defaultMaxPrice) count += 1;
  
  return count;
};

export const filterPhotos = (photos: Photo[], filters: PhotoFilters): Photo[] => {
  const { tags, photographers, locations, priceRange, sortBy } = filters;
  
  // Filter photos
  let filtered = [...photos];
  
  if (tags.length > 0) {
    filtered = filtered.filter(photo => 
      tags.some(tag => photo.tags.includes(tag))
    );
  }
  
  if (photographers.length > 0) {
    filtered = filtered.filter(photo => 
      photographers.includes(photo.photographer)
    );
  }
  
  if (locations.length > 0) {
    filtered = filtered.filter(photo => 
      locations.includes(photo.location)
    );
  }
  
  filtered = filtered.filter(photo => 
    photo.price >= priceRange[0] && photo.price <= priceRange[1]
  );
  
  // Sort photos
  switch (sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
      break;
    case 'popular':
      filtered.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'price_high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'price_low':
      filtered.sort((a, b) => a.price - b.price);
      break;
  }
  
  return filtered;
};
