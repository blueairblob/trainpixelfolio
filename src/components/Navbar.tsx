import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMobile } from '@/hooks/use-mobile';
import { useCart } from '@/context/CartContext';
import SearchBar from '@/components/SearchBar';

const Navbar = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === '/';

  // Calculate total items in cart
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Monitor scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const navbarClasses = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    isHomePage && !isScrolled 
      ? "bg-transparent text-white py-4 md:py-6" 
      : "bg-background/95 backdrop-blur-md border-b shadow-sm py-3 md:py-4"
  );
  
  const logoClasses = cn(
    "text-xl font-bold tracking-tight",
    isHomePage && !isScrolled ? "text-white" : "text-foreground"
  );
  
  const linkClasses = (active: boolean) => cn(
    "px-1 py-1.5 rounded-md text-sm transition-colors relative",
    isHomePage && !isScrolled 
      ? "text-white/90 hover:text-white"
      : "text-foreground/80 hover:text-foreground",
    active && "font-medium",
    active && (isHomePage && !isScrolled 
      ? "text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-white" 
      : "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground"
    )
  );
  
  const mobileMenuClasses = cn(
    isMobile ? "flex md:hidden" : "hidden"
  );
  
  const desktopMenuClasses = cn(
    isMobile ? "hidden md:flex" : "flex"
  );
  
  return (
    <header className={navbarClasses}>
      <div className="container px-6 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className={logoClasses}>
            TrainImagery
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className={cn(desktopMenuClasses, "items-center gap-1 mx-4")}>
          <Link to="/" className={linkClasses(location.pathname === '/')}>
            Home
          </Link>
          <Link to="/gallery" className={linkClasses(location.pathname === '/gallery')}>
            Gallery
          </Link>
          <Link to="#" className={linkClasses(false)}>
            Collections
          </Link>
          <Link to="#" className={linkClasses(false)}>
            Photographers
          </Link>
          <Link to="#" className={linkClasses(false)}>
            Pricing
          </Link>
        </nav>
        
        {/* Search and Cart */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block w-64">
            <SearchBar variant="navbar" />
          </div>
          
          <Link to="/cart">
            <Button 
              variant={isHomePage && !isScrolled ? "outline" : "ghost"} 
              size="icon"
              className={cn(
                "relative",
                isHomePage && !isScrolled && "border-white/20 text-white hover:bg-white/10"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className={mobileMenuClasses}>
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant={isHomePage && !isScrolled ? "outline" : "ghost"} 
                  size="icon"
                  className={isHomePage && !isScrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-12">
                <nav className="flex flex-col gap-4">
                  <div className="px-2 pb-4">
                    <SearchBar />
                  </div>
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/gallery" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    Gallery
                  </Link>
                  <Link 
                    to="#" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    Collections
                  </Link>
                  <Link 
                    to="#" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    Photographers
                  </Link>
                  <Link 
                    to="#" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-secondary"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart ({cartItemsCount})
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
