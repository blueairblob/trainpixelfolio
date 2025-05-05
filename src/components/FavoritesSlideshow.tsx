// src/components/FavoriteSlideshow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { photoService } from '@/api/supabase';

interface FavoriteSlideshowProps {
  onPhotoPress: (id: string) => void;
  maxSlides?: number;
}

const { width } = Dimensions.get('window');

const FavoriteSlideshow: React.FC<FavoriteSlideshowProps> = ({ 
  onPhotoPress, 
  maxSlides = 5 
}) => {
  // Access favorites from auth context
  const { userProfile, isAdmin } = useAuth();
  
  // State variables
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // References
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Admin favorites - fallback if user has none
  const ADMIN_FAVORITES = [
    // These would typically come from a settings table or admin favorites
    // For now hardcoding some IDs (assuming these exist in your database)
    'IMG00001',
    'IMG00002',
    'IMG00003',
    'IMG00004',
    'IMG00005'
  ];

  // Load favorites from user or default admin set
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Determine which favorites to use
        let favoriteIds: string[] = [];
        
        if (userProfile?.favorites && userProfile.favorites.length > 0) {
          // Use user favorites if available
          favoriteIds = userProfile.favorites.slice(0, maxSlides);
          console.log(`Loading ${favoriteIds.length} user favorites for slideshow`);
        } else {
          // Fall back to admin favorites
          favoriteIds = ADMIN_FAVORITES.slice(0, maxSlides);
          console.log(`Loading ${favoriteIds.length} admin favorites for slideshow`);
        }
        
        if (favoriteIds.length === 0) {
          setSlides([]);
          setIsLoading(false);
          return;
        }
        
        // Load each favorite photo
        const loadedSlides = [];
        for (const id of favoriteIds) {
          try {
            const { data: photo } = await photoService.getPhotoById(id);
            if (photo) {
              loadedSlides.push(photo);
            }
          } catch (err) {
            console.error(`Error loading slide photo ${id}:`, err);
            // Continue with other photos even if one fails
          }
        }
        
        setSlides(loadedSlides);
      } catch (err) {
        console.error('Error loading slideshow photos:', err);
        setError('Failed to load favorite photos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
    
    // Clean up function to clear any timers
    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }
    };
  }, [userProfile?.favorites, maxSlides]);

  // Set up auto-scrolling once slides are loaded
  useEffect(() => {
    if (slides.length <= 1) return;
    
    // Start auto-scrolling
    startAutoScroll();
    
    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }
    };
  }, [slides]);

  // Function to start auto-scrolling
  const startAutoScroll = () => {
    // Clear any existing timer
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
    }
    
    // Set up a new timer for auto-scrolling
    slideTimer.current = setInterval(() => {
      if (flatListRef.current && slides.length > 0) {
        const nextIndex = (activeIndex + 1) % slides.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setActiveIndex(nextIndex);
      }
    }, 4000); // Change slide every 4 seconds
  };

  // Handle manual slide changes
  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      
      // Reset timer when manually changing slides
      startAutoScroll();
    }
  }).current;

  // Handle press on a slide
  const handleSlidePress = (id: string) => {
    onPhotoPress(id);
  };

  // If loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading favorite photos...</Text>
      </View>
    );
  }
  
  // If error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  // If no slides
  if (slides.length === 0) {
    return null; // Don't show anything if no slides
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favourite Photos</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.image_no}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.slide}
            onPress={() => handleSlidePress(item.image_no)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.slideImage}
              resizeMode="cover"
            />
            <View style={styles.slideInfo}>
              <Text style={styles.slideTitle} numberOfLines={1}>
                {item.description || 'Untitled Photo'}
              </Text>
              <Text style={styles.slidePhotographer} numberOfLines={1}>
                {item.photographer || 'Unknown photographer'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  slide: {
    width: width - 32, // Full width minus padding
    height: 220,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  slideTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  slidePhotographer: {
    color: '#e5e7eb',
    fontSize: 14,
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4f46e5',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FavoriteSlideshow;