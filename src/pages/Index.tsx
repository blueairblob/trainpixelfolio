
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Train, MapPin, Camera, TrainTrack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import FeaturedPhoto from '@/components/FeaturedPhoto';
import PhotoCard from '@/components/PhotoCard';
import SearchBar from '@/components/SearchBar';
import { Photo } from '@/context/CartContext';
import { StaggerChildren } from '@/utils/animations';

// Sample featured photo
const featuredPhoto: Photo = {
  id: "train-1",
  title: "Mountain Express at Sunset",
  description: "A stunning mountain railway scene with a vintage train passing through alpine scenery as the sun sets in the background, creating a golden glow over the landscape.",
  price: 79.99,
  imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80",
  photographer: "Thomas Railway",
  location: "Swiss Alps",
  tags: ["mountains", "sunset", "vintage"]
};

// Popular photos for horizontal scroll section
const popularPhotos: Photo[] = [
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
    id: "train-9",
    title: "Snow Journey",
    description: "Train cutting through heavy snow in mountain pass.",
    price: 69.99,
    imageUrl: "https://images.unsplash.com/photo-1518458476302-cee643d3aa5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Winter Rails",
    location: "Norwegian Mountains",
    tags: ["snow", "winter", "mountains"]
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
    id: "train-7",
    title: "Industrial Yard",
    description: "Freight trains in an industrial railway yard at dusk.",
    price: 44.99,
    imageUrl: "https://images.unsplash.com/photo-1553576900-9c8bec2bbef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    photographer: "Industrial Eye",
    location: "Rotterdam, Netherlands",
    tags: ["industrial", "freight", "dusk"]
  }
];

// Categories section
const categories = [
  { 
    name: "Vintage Trains", 
    icon: <Train className="h-5 w-5" />,
    count: "216 photos",
    image: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  { 
    name: "Train Stations", 
    icon: <MapPin className="h-5 w-5" />,
    count: "183 photos",
    image: "https://images.unsplash.com/photo-1609618996942-44532fa2e24d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  { 
    name: "Railway Photography", 
    icon: <Camera className="h-5 w-5" />,
    count: "309 photos",
    image: "https://images.unsplash.com/photo-1553576900-9c8bec2bbef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  { 
    name: "Scenic Routes", 
    icon: <TrainTrack className="h-5 w-5" />,
    count: "157 photos",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero section with search */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10" />
        <div className="relative h-[600px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80"
            alt="Train in mountains" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Premium Train Photography
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Discover and license stunning train imagery for your projects
            </p>
          </div>
          
          <SearchBar className="w-full max-w-2xl" />
          
          <div className="flex gap-2 mt-8">
            <Link to="/gallery">
              <Button variant="secondary" size="lg">
                Browse Gallery
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Popular Images
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories section */}
      <section className="py-16 bg-secondary/50">
        <div className="container px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium">Browse Categories</h2>
            <Link to="/gallery" className="text-sm flex items-center text-primary hover:underline">
              View all categories <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link to="/gallery" key={index} className="group">
                <div className="relative overflow-hidden rounded-xl bg-muted aspect-[4/3]">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      {category.icon}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <p className="text-xs text-white/80">{category.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured content */}
      <section className="py-16">
        <div className="container px-6">
          <FeaturedPhoto photo={featuredPhoto} />
        </div>
      </section>
      
      {/* Popular photos horizontal scroll */}
      <section className="py-16 bg-secondary/30">
        <div className="container px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium">Popular Images</h2>
            <Link to="/gallery" className="text-sm flex items-center text-primary hover:underline">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerChildren>
              {popularPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} priority />
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>
      
      {/* Promo section */}
      <section className="py-16">
        <div className="container px-6">
          <div className="bg-primary text-primary-foreground rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-4">Join Our Photographers</h2>
                <p className="mb-6">Share your train photography with our community and earn royalties on every license.</p>
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </div>
              <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1535674882465-81daca9e29d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Photographer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer section */}
      <footer className="py-12 bg-secondary">
        <div className="container px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Train Images</a></li>
                <li><a href="#" className="hover:text-foreground">Licensing</a></li>
                <li><a href="#" className="hover:text-foreground">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">FAQs</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TrainImagery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
