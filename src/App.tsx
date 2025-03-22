
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './mobile/screens/HomeScreen';
import GalleryScreen from './mobile/screens/GalleryScreen';
import PhotoDetailScreen from './mobile/screens/PhotoDetailScreen';
import CartScreen from './mobile/screens/CartScreen';
import ProfileScreen from './mobile/screens/ProfileScreen';
import AuthScreen from './mobile/screens/AuthScreen';

// Import auth provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Define route param types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PhotoDetail: { id: string; title?: string };
};

// Create the navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Gallery') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Navigation component that uses auth context
const Navigation = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // You could add a splash screen or loading indicator here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
            />
            <Stack.Screen 
              name="PhotoDetail" 
              component={PhotoDetailScreen} 
              options={({ route }) => {
                // Use a type assertion since TypeScript doesn't know the structure
                const params = route.params as { title?: string, id: string };
                return { 
                  title: params?.title || 'Photo Details',
                  headerShown: true
                };
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root App component
const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
