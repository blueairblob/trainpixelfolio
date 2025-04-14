
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user data for demo purposes
const USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

export const login = async (email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = USERS.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Create a user session object without the password
  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: `mock-jwt-token-${user.id}`,
  };
  
  // Save the session data to AsyncStorage
  await AsyncStorage.setItem('userToken', userSession.token);
  await AsyncStorage.setItem('userRole', userSession.role);
  await AsyncStorage.setItem('userProfile', JSON.stringify(userSession));
  
  return userSession;
};

export const register = async (name, email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = USERS.find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // In a real app, this would be a POST request to your API
  // For this demo, we'll just create a mock user
  const newUser = {
    id: `${USERS.length + 1}`,
    name,
    email,
    password,
    role: 'user'
  };
  
  // Add user to our mock database
  USERS.push(newUser);
  
  // Create user session without the password
  const userSession = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    token: `mock-jwt-token-${newUser.id}`,
  };
  
  // Save the session data
  await AsyncStorage.setItem('userToken', userSession.token);
  await AsyncStorage.setItem('userRole', userSession.role);
  await AsyncStorage.setItem('userProfile', JSON.stringify(userSession));
  
  return userSession;
};

export const logout = async () => {
  // Remove all session data
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userRole');
  await AsyncStorage.removeItem('userProfile');
};

export const getCurrentUser = async () => {
  const userProfileJson = await AsyncStorage.getItem('userProfile');
  if (!userProfileJson) {
    return null;
  }
  return JSON.parse(userProfileJson);
};

export const checkAuth = async () => {
  const token = await AsyncStorage.getItem('userToken');
  const role = await AsyncStorage.getItem('userRole');
  
  if (!token) {
    return { isAuthenticated: false, isAdmin: false };
  }
  
  return { 
    isAuthenticated: true, 
    isAdmin: role === 'admin' 
  };
};
