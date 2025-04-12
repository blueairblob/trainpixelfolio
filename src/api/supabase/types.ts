// src/api/supabase/types.ts
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create types from the Database definition
export type Tables = Database['public']['Tables'] & Database['dev']['Tables'];
export type Views = Database['public']['Views'] & Database['dev']['Views'];
export type Functions = Database['public']['Functions'] & Database['dev']['Functions'];

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
export type UserProfile = Tables['profiles']['Row'];
export type UserProfileInsert = Tables['profiles']['Insert']; 
export type UserProfileUpdate = Tables['profiles']['Update'];

/**
 * Extended user profile with additional info
 */
export interface ExtendedUserProfile extends UserProfile {
  favorites: string[];
  isAdmin: boolean;
  orders?: any[];
}

/**
 * Photo type representing a catalog photo from the mobile_catalog_view
 */
export type Photo = Views['mobile_catalog_view']['Row'] & {
  id?: string;  // For compatibility with existing code
  image_url?: string;
  thumbnail_url?: string;
  price?: number; // For compatibility with existing code
};

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

// Entity types based on database schema
export type Category = Tables['category']['Row'];
export type CategoryInsert = Tables['category']['Insert'];
export type CategoryUpdate = Tables['category']['Update'];

export type Photographer = Tables['photographer']['Row'];
export type PhotographerInsert = Tables['photographer']['Insert'];
export type PhotographerUpdate = Tables['photographer']['Update'];

export type Location = Tables['location']['Row'];
export type LocationInsert = Tables['location']['Insert'];
export type LocationUpdate = Tables['location']['Update'];

export type Organisation = Tables['organisation']['Row'];
export type OrganisationInsert = Tables['organisation']['Insert'];
export type OrganisationUpdate = Tables['organisation']['Update'];

export type Country = Tables['country']['Row'];
export type CountryInsert = Tables['country']['Insert'];
export type CountryUpdate = Tables['country']['Update'];

export type Collection = Tables['collection']['Row'];
export type CollectionInsert = Tables['collection']['Insert'];
export type CollectionUpdate = Tables['collection']['Update'];

export type Builder = Tables['builder']['Row'];
export type BuilderInsert = Tables['builder']['Insert'];
export type BuilderUpdate = Tables['builder']['Update'];

export type Catalog = Tables['catalog']['Row'];
export type CatalogInsert = Tables['catalog']['Insert'];
export type CatalogUpdate = Tables['catalog']['Update'];

export type CatalogMetadata = Tables['catalog_metadata']['Row'];
export type CatalogMetadataInsert = Tables['catalog_metadata']['Insert'];
export type CatalogMetadataUpdate = Tables['catalog_metadata']['Update'];

export type CatalogBuilder = Tables['catalog_builder']['Row'];
export type CatalogBuilderInsert = Tables['catalog_builder']['Insert'];
export type CatalogBuilderUpdate = Tables['catalog_builder']['Update'];

export type PictureMetadata = Tables['picture_metadata']['Row'];
export type PictureMetadataInsert = Tables['picture_metadata']['Insert'];
export type PictureMetadataUpdate = Tables['picture_metadata']['Update'];

export type Usage = Tables['usage']['Row'];
export type UsageInsert = Tables['usage']['Insert'];
export type UsageUpdate = Tables['usage']['Update'];

export type UserRole = Tables['user_roles']['Row'];
export type UserRoleInsert = Tables['user_roles']['Insert'];
export type UserRoleUpdate = Tables['user_roles']['Update'];