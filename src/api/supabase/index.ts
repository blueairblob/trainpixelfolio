// src/api/supabase/index.ts
// Re-export everything from the API modules for easy imports

// Export the client
export { supabaseClient, supabasePublicClient } from './client';

// Export services
export { authService } from './services/authService';
export { userService } from './services/userService';
export { photoService } from './services/photoService';
export { cartService } from './services/cartService';
export { adminService } from './services/adminService';
export { filterService } from './services/filterService';
export { photoAdminService } from './services/photoAdminService';

// Export types
export * from './types';