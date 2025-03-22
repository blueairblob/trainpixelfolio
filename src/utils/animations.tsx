
import { Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

// Function to create a fade-in animation
export const fadeInAnimation = (animatedValue: Animated.Value, duration = 500) => {
  Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start();
};

// Function to create a slide-in animation
export const slideInAnimation = (
  animatedValue: Animated.Value, 
  from: number, 
  to: number, 
  duration = 500
) => {
  Animated.timing(animatedValue, {
    toValue: to,
    duration,
    useNativeDriver: true,
  }).start();
};

// Function to create a spring animation
export const springAnimation = (
  animatedValue: Animated.Value, 
  toValue: number, 
  friction = 7, 
  tension = 40
) => {
  Animated.spring(animatedValue, {
    toValue,
    friction,
    tension,
    useNativeDriver: true,
  }).start();
};

// Function to create a sequence of animations
export const sequenceAnimations = (animations: Animated.CompositeAnimation[]) => {
  Animated.sequence(animations).start();
};

// Function to create a stagger animation for a list of items
export const staggerAnimations = (
  animatedValues: Animated.Value[], 
  toValue: number, 
  duration = 300, 
  delay = 50
) => {
  const animations = animatedValues.map((value) =>
    Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
    })
  );
  
  Animated.stagger(delay, animations).start();
};

// Export animated number format function (for numeric displays)
export const formatNumber = (value: number, decimals = 0) => {
  return value.toFixed(decimals);
};

// Add AnimatedNumber component
interface AnimatedNumberProps {
  value: number;
  formatValue?: (value: number) => string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  formatValue = (val) => val.toString(), 
  duration = 500 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = start + (end - start) * progress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      } else {
        prevValue.current = end;
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value, duration]);
  
  return <>{formatValue(displayValue)}</>;
};

// Add StaggerChildren component
interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerMs?: number;
  delayMs?: number;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({ 
  children, 
  staggerMs = 50, 
  delayMs = 0 
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          ...child.props,
          style: {
            ...child.props.style,
            animationDelay: `${delayMs + (index * staggerMs)}ms`,
            animationFillMode: 'both',
            animationName: 'fade-in',
            animationDuration: '300ms'
          },
          className: `animate-fade-in ${child.props.className || ''}`
        });
      })}
    </>
  );
};
