// App.tsx - Updated with feature flags
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import AuthScreen from './src/screens/AuthScreen';

// Context Providers
import { FilterProvider } from './src/context/FilterContext';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Feature flags
import { FEATURES, canShowCart, canShowAuth, canShowAdminPanel } from './src/config/features';

// Create the navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Icon mapping for tab navigation
const getTabIcon = (route: string, focused: boolean): string => {
  switch (route) {
    case 'Home': return focused ? 'home' : 'home-outline';
    case 'Gallery': return focused ? 'grid' : 'grid-outline';
    case 'Cart': return focused ? 'cart' : 'cart-outline';
    case 'Profile': return focused ? 'person' : 'person-outline';
    default: return 'help-outline';
  }
};

// Main tab navigator with conditional tabs
const TabNavigator = () => {
  const { isAdmin } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      
      {/* Conditionally show Cart tab */}
      {canShowCart() && (
        <Tab.Screen name="Cart" component={CartScreen} />
      )}
      
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root navigator with conditional auth
const RootNavigator = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  
  // Show nothing while checking authentication status
  if (isLoading) {
    return null;
  }

  // If authentication is disabled, always go to main app
  // (users will be automatically set to guest mode)
  const shouldShowAuth = canShowAuth() && !isAuthenticated && !isGuest;

  return (
    <Stack.Navigator>
      {shouldShowAuth ? (
        <Stack.Screen 
          name="AuthScreen" 
          component={AuthScreen} 
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PhotoDetailScreen" 
            component={PhotoDetailScreen}
            options={{ headerShown: false, title: 'Photo Details' }} 
          />
          
          {/* Conditionally show Cart screen */}
          {canShowCart() && (
            <Stack.Screen 
              name="CartScreen" 
              component={CartScreen}
              options={{ headerShown: false, title: 'Shopping Cart' }}
            />
          )}
          
          {/* Conditionally show Admin screen */}
          {canShowAdminPanel() && (
            <Stack.Screen 
              name="AdminScreen" 
              component={AdminScreen}
              options={{ headerShown: false, title: 'Admin Dashboard' }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

// Feature flag info component for development
const FeatureFlagInfo = () => {
  if (!__DEV__) return null;
  
  console.log('🏗️ Feature Flags Status:', {
    AUTH: FEATURES.ENABLE_AUTHENTICATION,
    CART: FEATURES.ENABLE_CART,
    PRICING: FEATURES.ENABLE_PRICING,
    GUEST_MODE: FEATURES.FORCE_GUEST_MODE,
    ADMIN: FEATURES.ENABLE_ADMIN_PANEL,
  });
  
  return null;
};

const App = () => {
  console.log("🚀 Running Pica Loco App.tsx");
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <FilterProvider>
            <NavigationContainer>
              <FeatureFlagInfo />
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </FilterProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;