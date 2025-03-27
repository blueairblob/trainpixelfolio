import { createClient } from '@supabase/supabase-js';

// Option 1: Using process.env with dotenv
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Option 2: Using expo-constants (if you're using Expo's config system)
// import Constants from 'expo-constants';
// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
// const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be provided in the .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);