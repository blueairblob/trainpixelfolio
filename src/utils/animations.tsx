
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Add classes to element after mount for entrance animations
export const useEntranceAnimation = (
  initialClass: string, 
  animatedClass: string, 
  delay: number = 0
) => {
  const [classes, setClasses] = useState(initialClass);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setClasses(cn(initialClass, animatedClass));
    }, delay);
    
    return () => clearTimeout(timer);
  }, [initialClass, animatedClass, delay]);
  
  return classes;
};

// Staggered entrance for lists of items
export const StaggerChildren: React.FC<{
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
  staggerDelay?: number;
  animation?: string;
}> = ({ 
  children, 
  className = '', 
  baseDelay = 100, 
  staggerDelay = 50,
  animation = 'animate-fade-in'
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const delay = baseDelay + (index * staggerDelay);
        
        return React.cloneElement(child as React.ReactElement, {
          style: {
            ...((child as React.ReactElement).props.style || {}),
            animationDelay: `${delay}ms`,
            opacity: 0,
            animation: animation,
            animationFillMode: 'forwards',
          },
        });
      })}
    </div>
  );
};

// Smooth scroll to element
export const scrollToElement = (elementId: string, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Animate value changes (like prices, counts, etc)
export const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}> = ({ 
  value, 
  duration = 500, 
  formatValue = (val) => val.toFixed(2),
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const change = value - startValue;
    
    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = progress * (2 - progress); // Simple easing function
      
      setDisplayValue(startValue + change * easedProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(value);
      }
    };
    
    window.requestAnimationFrame(animateValue);
  }, [value, duration]);
  
  return <span className={className}>{formatValue(displayValue)}</span>;
};

// Parallax effect hook for scrolling
export const useParallax = (speed: number = 0.5): [React.RefObject<HTMLDivElement>, number] => {
  const [offset, setOffset] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const scrollY = window.scrollY;
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementVisible = rect.height + elementTop;
      
      if (scrollY > elementTop - window.innerHeight && scrollY < elementVisible) {
        const distance = scrollY - elementTop + window.innerHeight;
        setOffset(distance * speed);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return [ref, offset];
};
