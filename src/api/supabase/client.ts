// src/api/supabase/client.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration error: Missing environment variables');
  throw new Error('Supabase configuration error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Create a single Supabase client for interacting with your database
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  db: { schema: 'dev' }, // Set default schema to dev
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: AsyncStorage,
  }
});

// src/api/supabase/types.ts
import { Session, User } from '@supabase/supabase-js';

/**
 * Common response type for all API operations
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Auth response type
 */
export interface AuthResponse {
  session: Session | null;
  user: User | null;
  error?: Error;
}

/**
 * User profile type
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email?: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Extended user profile with additional info
 */
export interface ExtendedUserProfile extends UserProfile {
  favorites: string[];
  isAdmin: boolean;
  orders?: any[];
}

/**
 * Photo type representing a catalog photo
 */
export interface Photo {
  image_no: string;
  id?: string;  // For compatibility with existing code
  category?: string | null;
  date_taken?: string | null;
  circa?: boolean | null;
  imprecise_date?: boolean | null;
  description?: string | null;
  gauge?: string | null;
  thumbnail_url?: string;
  image_url?: string;
  country?: string | null;
  organisation?: string | null;
  organisation_type?: string | null;
  location?: string | null;
  route?: string | null;
  collection?: string | null;
  photographer?: string | null;
  prints_allowed?: boolean | null;
  internet_use?: boolean | null;
  publications_use?: boolean | null;
  builders?: any[] | null;
  file_type?: string | null;
  width?: number | null;
  height?: number | null;
  resolution?: number | null;
  colour_space?: string | null;
  colour_mode?: string | null;
  last_updated?: string | null;
  price?: number; // For compatibility with existing code
}

/**
 * Filter options for photo queries
 */
export interface PhotoFilter {
  category?: string;
  photographer?: string;
  location?: string;
  organisation?: string;
  dateFrom?: string;
  dateTo?: string;
  gauge?: string;
  searchQuery?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  useCache?: boolean;
  cacheDuration?: number; // minutes
  forceFresh?: boolean;
}

/**
 * Cart item
 */
export interface CartItem {
  id: string;
  quantity: number;
}

/**
 * Cart item with details
 */
export interface CartItemWithDetails extends CartItem {
  title: string;
  imageUrl: string;
  price: number;
  photographer: string;
  location?: string;
  description?: string;
}

/**
 * Thumbnail metadata
 */
export interface ThumbnailUploadResult {
  thumbnailId: string;
  thumbnailUrl: string;
  imageNo: string;
  metadataId: string;
}

/**
 * Photo metadata for upload
 */
export interface PhotoMetadata {
  description?: string;
  category?: string;
  dateTaken?: string;
  photographer?: string;
  location?: string;
  organisation?: string;
  gauge?: string;
  tags?: string[];
  userId: string;
}

// src/api/supabase/index.ts
// Export everything from the API for easy imports
export * from './client';
export * from './types';
export * from './services/authService';
export * from './services/photoService';
export * from './services/userService';
export * from './services/cartService';
export * from './services/adminService';