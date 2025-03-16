
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Tag, MapPin, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import PhotoCard from '@/components/PhotoCard';
import { Photo, useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { StaggerChildren } from '@/utils/animations';

// Sample data
const allPhotos: Photo[] = [
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

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [relatedPhotos, setRelatedPhotos] = useState<Photo[]>([]);
  
  useEffect(() => {
    // Reset state on photo change
    setIsImageLoaded(false);
    
    // Find the photo with the matching ID
    const foundPhoto = allPhotos.find(p => p.id === id);
    
    if (foundPhoto) {
      setPhoto(foundPhoto);
      
      // Find related photos based on tags
      const related = allPhotos
        .filter(p => 
          p.id !== id && // Not the current photo
          p.tags.some(tag => foundPhoto.tags.includes(tag)) // Has at least one matching tag
        )
        .slice(0, 3); // Limit to 3 related photos
      
      setRelatedPhotos(related);
    } else {
      // Photo not found
      navigate('/gallery', { replace: true });
    }
  }, [id, navigate]);
  
  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(photo);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container px-6 pt-32">
        {/* Back navigation */}
        <Link 
          to="/gallery" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Gallery
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Photo */}
          <div>
            <div className="relative overflow-hidden rounded-xl bg-muted">
              {/* Placeholder blur */}
              <div 
                className={cn(
                  "absolute inset-0 bg-muted backdrop-blur-md transition-opacity duration-500",
                  isImageLoaded ? "opacity-0" : "opacity-100"
                )}
              />
              
              <img 
                src={photo.imageUrl}
                alt={photo.title}
                className={cn(
                  "w-full object-cover transition-all duration-500",
                  isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="flex flex-col">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-medium tracking-tight">{photo.title}</h1>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="px-3 py-1 rounded-full bg-accent text-muted-foreground text-sm">
                  Premium
                </div>
                
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{photo.id.replace('train-', '#')}</span>
              </div>
              
              <div className="mt-6 text-xl font-medium">
                ${photo.price.toFixed(2)}
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{photo.description}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Photographer:</span>
                    <span>{photo.photographer}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span>{photo.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span>2023</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.map(tag => (
                        <span key={tag} className="text-primary">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related photos */}
        {relatedPhotos.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-medium mb-8">You may also like</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaggerChildren>
                {relatedPhotos.map(relatedPhoto => (
                  <PhotoCard 
                    key={relatedPhoto.id} 
                    photo={relatedPhoto} 
                  />
                ))}
              </StaggerChildren>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoDetail;
