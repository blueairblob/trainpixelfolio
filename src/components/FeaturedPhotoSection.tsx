// FeaturedPhotoSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { photoService } from '@/api/supabase';
import { slideshowService } from '@/api/supabase';
import { useAuth } from '@/context/AuthContext';

interface FeaturedPhoto {
  id: string;
  title: string;
  description: string;
  photographer: string;
  location: string;
  price: number;
  imageUrl: string;
}

interface FeaturedPhotoSectionProps {
  featuredPhoto?: FeaturedPhoto;
  onViewDetailsPress: (photoId: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Full width minus padding

const FeaturedPhotoSection = ({ featuredPhoto, onViewDetailsPress }: FeaturedPhotoSectionProps) => {
  // State for active category
  const [activeCategory, setActiveCategory] = useState('featured');
  const [photo, setPhoto] = useState<FeaturedPhoto | null>(featuredPhoto || null);
  const [favoritePhotos, setFavoritePhotos] = useState<FeaturedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for slideshow
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideshowRef = useRef<ScrollView>(null);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Added: Toggle state for minimal/detailed view
  const [isMinimalView, setIsMinimalView] = useState(true);
  
  // Get auth context to check favorites
  const { userProfile } = useAuth();

  // Categories for the section
  const categories = [
    { id: 'featured', title: 'Featured', icon: 'star-outline' },
    { id: 'favorites', title: 'Favorites', icon: 'heart-outline' },
    { id: 'new', title: 'New', icon: 'time-outline' },
    { id: 'popular', title: 'Popular', icon: 'flame-outline' }
  ];

  useEffect(() => {
    loadContent();
  }, [activeCategory]);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    };
  }, [autoPlayTimer]);

  // Setup autoplay for favorites slideshow
  useEffect(() => {
    if (activeCategory === 'favorites' && favoritePhotos.length > 1) {
      // Clear existing timer
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }

      // Set up a new timer
      const timer = setInterval(() => {
        if (favoritePhotos.length > 0) {
          const nextIndex = (currentIndex + 1) % favoritePhotos.length;
          setCurrentIndex(nextIndex);
          slideshowRef.current?.scrollTo({
            x: nextIndex * CARD_WIDTH,
            animated: true
          });
        }
      }, 5000); // Change slide every 5 seconds

      setAutoPlayTimer(timer);
    } else if (autoPlayTimer) {
      // Clear timer if we're not on favorites
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }

    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    };
  }, [activeCategory, favoritePhotos.length, currentIndex]);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    
    if (activeCategory === 'favorites') {
      await loadFavorites();
    } else {
      await loadSinglePhoto();
    }
    
    setIsLoading(false);
  };

  const loadFavorites = async () => {
    try {
      // Reset favorites
      setFavoritePhotos([]);
      
      // Get slideshow photos from service - this will use user favorites or fall back to admin defaults
      const { data: slideshowPhotos, error: slideshowError } = await slideshowService.getSlideshowPhotos(
        userProfile?.favorites,
        5 // Maximum number of slides
      );
      
      if (slideshowError) throw slideshowError;
      
      if (slideshowPhotos && slideshowPhotos.length > 0) {
        // Format the photos for display
        const formattedPhotos = slideshowPhotos.map(photo => formatPhotoData(photo));
        setFavoritePhotos(formattedPhotos);
        
        // Reset slideshow index
        setCurrentIndex(0);
        // Scroll to beginning
        setTimeout(() => {
          slideshowRef.current?.scrollTo({ x: 0, animated: false });
        }, 100);
      } else {
        // Modified this part to use the same error message as in AdminFavoritesSettings.tsx
        setError('No default favorites set');
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorite photos');
    }
  };

  const loadSinglePhoto = async () => {
    try {
      let loadedPhoto = null;

      switch (activeCategory) {
        case 'featured':
          // Use the provided featured photo or load one from API
          if (featuredPhoto) {
            loadedPhoto = featuredPhoto;
          } else {
            // If no featured photo provided, we'd fetch it from a service
            const { data } = await photoService.getCatalogPhotos({ page: 1, limit: 1 });
            if (data && data.length > 0) {
              loadedPhoto = formatPhotoData(data[0]);
            }
          }
          break;

        case 'new':
          // Get the most recent photo
          const { data: newPhotos } = await photoService.getCatalogPhotos({
            page: 1,
            limit: 1,
            useCache: false // To ensure we get the latest
          });
          if (newPhotos && newPhotos.length > 0) {
            loadedPhoto = formatPhotoData(newPhotos[0]);
          }
          break;

        case 'popular':
          // This would need a real endpoint to get popular photos
          // For now we'll simulate by getting a photo from a different page
          const { data: popularPhotos } = await photoService.getCatalogPhotos({
            page: 2,
            limit: 1
          });
          if (popularPhotos && popularPhotos.length > 0) {
            loadedPhoto = formatPhotoData(popularPhotos[0]);
          }
          break;
      }

      if (loadedPhoto) {
        setPhoto(loadedPhoto);
      } else {
        setError(`No photos available for ${activeCategory}`);
        // Fall back to featured photo if we have one
        if (featuredPhoto && activeCategory !== 'featured') {
          setPhoto(featuredPhoto);
        }
      }
    } catch (err) {
      console.error(`Error loading ${activeCategory} photo:`, err);
      setError(`Failed to load ${activeCategory} photo`);
      // Fall back to featured photo if we have one
      if (featuredPhoto && activeCategory !== 'featured') {
        setPhoto(featuredPhoto);
      }
    }
  };

  // Helper function to format photo data from API to match our component's expected structure
  const formatPhotoData = (apiPhoto: any): FeaturedPhoto => {
    return {
      id: apiPhoto.image_no || apiPhoto.id,
      title: apiPhoto.description || 'Untitled Photo',
      description: apiPhoto.description || 'No description available',
      photographer: apiPhoto.photographer || 'Unknown photographer',
      location: apiPhoto.location || 'Unknown location',
      price: apiPhoto.price || 0.50,
      imageUrl: apiPhoto.image_url || ''
    };
  };

  // Handle scroll event for the slideshow
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Handle manual slide change
  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / CARD_WIDTH);
    setCurrentIndex(newIndex);
  };

  // Toggle between minimal and detailed view
  const toggleView = () => {
    setIsMinimalView(!isMinimalView);
  };

  // Render a single featured photo card with toggle functionality
  const renderPhotoCard = (photoData: FeaturedPhoto) => {
    if (isMinimalView) {
      // Minimal view - similar to the example you provided
      return (
        <TouchableOpacity 
          style={styles.minimalCard}
          onPress={() => onViewDetailsPress(photoData.id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: photoData.imageUrl }}
            style={styles.minimalImage}
            resizeMode="cover"
          />
          <View style={styles.minimalInfo}>
            <Text style={styles.minimalTitle} numberOfLines={1}>
              {photoData.title}
            </Text>
            <Text style={styles.minimalPhotographer} numberOfLines={1}>
              {photoData.photographer}
            </Text>
          </View>
          
          {/* Toggle button overlaid on image */}
          <TouchableOpacity 
            style={styles.toggleButtonOverlay}
            onPress={toggleView}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          {/* Category badge */}
          {/* <View style={styles.minimalBadge}>
            <Ionicons 
              name={activeCategory === 'featured' ? 'star' : 
                    activeCategory === 'favorites' ? 'heart' :
                    activeCategory === 'new' ? 'time' : 'flame'} 
              size={12} 
              color="#ffffff" 
            />
          </View> */}
        </TouchableOpacity>
      );
    } else {
      // Detailed view - original format
      return (
        <View style={styles.featuredCard}>
          <Image 
            source={{ uri: photoData.imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredContent}>
            <View style={styles.headerRow}>
              <View style={styles.featuredBadge}>
                <Ionicons 
                  name={activeCategory === 'featured' ? 'star' : 
                        activeCategory === 'favorites' ? 'heart' :
                        activeCategory === 'new' ? 'time' : 'flame'} 
                  size={12} 
                  color="#ffffff" 
                />
                <Text style={styles.featuredBadgeText}>
                  {categories.find(c => c.id === activeCategory)?.title || 'Featured'}
                </Text>
              </View>
              
              {/* Toggle back to minimal view */}
              <TouchableOpacity onPress={toggleView} style={styles.toggleButton}>
                <Ionicons name="contract-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.featuredTitle}>{photoData.title}</Text>
            <Text style={styles.featuredDescription}>{photoData.description}</Text>
            
            <View style={styles.photographerRow}>
              <Text style={styles.photographerText}>By {photoData.photographer}</Text>
              <Text style={styles.locationText}>{photoData.location}</Text>
            </View>
            
            <View style={styles.featuredPrice}>
              <Text style={styles.licenseText}>Standard license</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => onViewDetailsPress(photoData.id)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  // Render slideshow pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {favoritePhotos.map((_, index) => {
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH
          ];
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { opacity, transform: [{ scale }] },
                currentIndex === index && styles.paginationDotActive
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Discover Trains</Text>
      
      {/* Category tabs */}
      <View style={styles.categoryTabs}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.id && styles.activeCategoryTab
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={activeCategory === category.id ? "#4f46e5" : "#6b7280"} 
            />
            <Text 
              style={[
                styles.categoryTabText,
                activeCategory === category.id && styles.activeCategoryTabText
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : error ? (
        // Modified this part to match the style from AdminFavoritesSettings.tsx
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No default favorites set</Text>
          <Text style={styles.emptySubtext}>
            Search for photos above to add them as defaults
          </Text>
        </View>
      ) : activeCategory === 'favorites' && favoritePhotos.length > 0 ? (
        // Favorites Slideshow
        <View>
          <Animated.ScrollView
            ref={slideshowRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="fast"
            contentContainerStyle={styles.slideshowContainer}
          >
            {favoritePhotos.map((favPhoto, index) => (
              <View key={`${favPhoto.id}-${index}`} style={{ width: CARD_WIDTH }}>
                {renderPhotoCard(favPhoto)}
              </View>
            ))}
          </Animated.ScrollView>
          
          {/* Pagination Dots */}
          {favoritePhotos.length > 1 && renderPaginationDots()}
        </View>
      ) : photo ? (
        // Single Photo Display
        renderPhotoCard(photo)
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  // Category tabs styles
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  activeCategoryTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  activeCategoryTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  // Slideshow styles
  slideshowContainer: {
    paddingRight: 0,
  },
  paginationContainer: {
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
  },
  // Loading and error states
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  // Added these styles from AdminFavoritesSettings.tsx
  emptyContainer: {
    height: 200,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Original error styles (keeping for compatibility)
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  // Minimal view styles
  minimalCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  minimalImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  minimalInfo: {
    padding: 12,
    backgroundColor: '#ffffff',
  },
  minimalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  minimalPhotographer: {
    fontSize: 13,
    color: '#6b7280',
  },
  toggleButtonOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  minimalBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  // Original detailed view styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 4,
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  photographerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photographerText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  featuredPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  licenseText: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#4f46e5',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default FeaturedPhotoSection;