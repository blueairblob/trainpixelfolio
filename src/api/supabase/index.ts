// src/api/supabase/index.ts
// Re-export everything from the API modules for easy imports

// Export the client
export { supabaseClient } from './client';

// Export services
export { authService } from './services/authService';
export { userService } from './services/userService';
export { photoService } from './services/photoService';
export { cartService } from './services/cartService';
export { adminService } from './services/adminService';

// Export types
export * from './types';