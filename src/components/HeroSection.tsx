
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80" 
          alt="Train photography" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Premium Train Photography
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-lg">
            Discover stunning high-quality train images for your creative projects
          </p>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/gallery">Explore Gallery</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
              <Link to="#" className="flex items-center gap-2">
                View Collections <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Popular Searches */}
      <div className="relative z-10 container mx-auto px-6 pb-8">
        <div className="absolute bottom-6 left-0 right-0">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-white/70 text-sm">Popular:</span>
            <Link to="/gallery" className="text-white text-sm hover:underline">Steam locomotives</Link>
            <span className="text-white/50">•</span>
            <Link to="/gallery" className="text-white text-sm hover:underline">Mountain railways</Link>
            <span className="text-white/50">•</span>
            <Link to="/gallery" className="text-white text-sm hover:underline">Urban transit</Link>
            <span className="text-white/50">•</span>
            <Link to="/gallery" className="text-white text-sm hover:underline">Vintage trains</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
