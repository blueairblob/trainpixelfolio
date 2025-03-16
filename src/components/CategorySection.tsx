
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'steam',
    title: 'Steam Locomotives',
    imageUrl: 'https://images.unsplash.com/photo-1527684651001-731c474bbb5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    description: 'Classic steam-powered engines from the golden age of rail'
  },
  {
    id: 'modern',
    title: 'Modern Trains',
    imageUrl: 'https://images.unsplash.com/photo-1679679008383-6f778fe07382?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'High-speed and contemporary passenger trains'
  },
  {
    id: 'stations',
    title: 'Railway Stations',
    imageUrl: 'https://images.unsplash.com/photo-1609618996942-44532fa2e24d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Historic and modern railway stations around the world'
  },
  {
    id: 'scenic',
    title: 'Scenic Railways',
    imageUrl: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
    description: 'Trains passing through breathtaking landscapes'
  }
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container px-6 mx-auto">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold">Browse by Category</h2>
          <Link to="/gallery" className="text-primary flex items-center text-sm font-medium hover:underline">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/gallery?category=${category.id}`} 
              className="group block overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={category.imageUrl} 
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-lg font-medium text-white mb-1">{category.title}</h3>
                  <p className="text-sm text-white/70">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
