// src/api/supabase/client.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration error: Missing environment variables');
  throw new Error('Supabase configuration error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Main Supabase client that uses the dev schema
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  db: { schema: 'dev' }, // Use dev schema by default for most operations
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: AsyncStorage,
  }
});

// Create a special client for accessing public schema tables without the schema setting
export const supabasePublicClient = createClient<Database>(supabaseUrl, supabaseKey, {
  // No schema specified - will use public schema by default
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: AsyncStorage,
  }
});