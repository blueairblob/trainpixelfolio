import { Animated } from 'react-native';

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
