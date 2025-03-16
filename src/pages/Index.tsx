
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import FeaturedPhoto from '@/components/FeaturedPhoto';
import PhotoCard from '@/components/PhotoCard';
import { StaggerChildren, useEntranceAnimation } from '@/utils/animations';
import { Photo } from '@/context/CartContext';

// Sample data
const featuredPhotos: Photo[] = [
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
  }
];

const popularPhotos: Photo[] = [
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
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80",
    photographer: "Urban Shutter",
    location: "New York City, USA",
    tags: ["subway", "motion", "urban"]
  },
  {
    id: "train-6",
    title: "Coastal Line",
    description: "Passenger train running along scenic coastal track.",
    price: 64.99,
    imageUrl: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    photographer: "Coastal Captures",
    location: "California Coast, USA",
    tags: ["coastal", "scenic", "passenger"]
  }
];

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroClasses = useEntranceAnimation('opacity-0 translate-y-6', 'opacity-100 translate-y-0');
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1476067897447-d0c5df27b5df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            transform: `translateY(${scrollY * 0.4}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 container px-6 md:max-w-4xl text-center">
          <div className={cn("transition-all duration-1000 delay-300", heroClasses)}>
            <div className="inline-flex items-center py-1.5 px-3 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
              <Train className="h-4 w-4 mr-2" />
              Premium Train Photography
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white max-w-2xl mx-auto leading-tight tracking-tight">
              Capture the beauty of rail journeys
            </h1>
            
            <p className="mt-6 text-xl text-white/80 max-w-xl mx-auto">
              Discover and purchase stunning train photographs from renowned photographers around the world.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/gallery">
                <Button size="lg" className="rounded-full px-8">
                  Browse Gallery
                </Button>
              </Link>
              
              <Link to="#featured">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8">
                  Featured Photos
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/50 flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-slide-down" />
          </div>
        </div>
      </section>
      
      {/* Featured Photos Section */}
      <section id="featured" className="py-20 md:py-32">
        <div className="container px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-accent text-xs font-medium mb-4">
              Curated Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Featured Photographs
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Each photograph tells a unique story of railways and trains, captured with precision and artistic vision.
            </p>
          </div>
          
          <div className="space-y-24">
            {featuredPhotos.map((photo, index) => (
              <FeaturedPhoto 
                key={photo.id} 
                photo={photo} 
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Photos Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <div className="flex justify-between items-end flex-wrap gap-4 mb-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-xs font-medium mb-4">
                Popular Picks
              </span>
              <h2 className="text-3xl font-medium tracking-tight">
                Our Collection
              </h2>
            </div>
            
            <Link to="/gallery" className="flex items-center text-sm font-medium hover:underline">
              View All Photos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerChildren baseDelay={100} staggerDelay={150}>
              {popularPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 md:py-32">
        <div className="container px-6">
          <div className="bg-accent rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-primary/5 translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                Start Your Collection Today
              </h2>
              <p className="mt-4 text-muted-foreground">
                Browse our exclusive collection of train photographs and elevate your space with these captivating images.
              </p>
              <div className="mt-8">
                <Link to="/gallery">
                  <Button size="lg" className="rounded-full px-8">
                    Explore Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-medium">TrainPixel</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Premium railway photography
              </p>
            </div>
            
            <div className="flex gap-8">
              <Link to="/" className="text-sm hover:underline">Home</Link>
              <Link to="/gallery" className="text-sm hover:underline">Gallery</Link>
              <Link to="/cart" className="text-sm hover:underline">Cart</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TrainPixel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
