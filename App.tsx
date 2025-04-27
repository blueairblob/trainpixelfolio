// App.tsx
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

// Main tab navigator
const TabNavigator = () => {
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
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root navigator with auth check
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show nothing while checking authentication status
  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
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
          <Stack.Screen 
            name="AdminScreen" 
            component={AdminScreen}
            options={{ headerShown: false, title: 'Admin Dashboard' }}
            // This allows us to pass parameters to navigate to specific admin tab
            // and set up edit mode for photos
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// App component with auth provider
const App = () => {
  console.log("Running App.tsx");

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <FilterProvider>
            <NavigationContainer>
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