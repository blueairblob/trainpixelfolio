
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user database
const users = [
  {
    id: 'user1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 'user2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

// Initialize users in AsyncStorage
const initializeUsers = async () => {
  try {
    const existingUsers = await AsyncStorage.getItem('users');
    if (!existingUsers) {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Call initialization when the file is imported
initializeUsers();

// Login function
export const login = async (email, password) => {
  try {
    // Get users from storage
    const usersJson = await AsyncStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Find user with matching email and password
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Return user data and token (in a real app, you'd generate a proper token)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: `mock-token-${user.id}-${Date.now()}`
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const register = async (name, email, password) => {
  try {
    // Get users from storage
    const usersJson = await AsyncStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Check if email already exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: `user${Date.now()}`,
      name,
      email,
      password,
      role: 'user' // Default role
    };
    
    // Save updated users
    const updatedUsers = [...users, newUser];
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Return user data and token
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: `mock-token-${newUser.id}-${Date.now()}`
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Password reset request (mock implementation)
export const requestPasswordReset = async (email) => {
  try {
    // Get users from storage
    const usersJson = await AsyncStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Check if email exists
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      throw new Error('Email not found');
    }
    
    // In a real app, send an email with reset link
    // Here we just return success
    return { success: true, message: 'Password reset link sent' };
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};
