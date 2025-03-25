import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("Supabase Key:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: { schema: 'dev' } // Set default schema to dev
});

//export const supabase = createClient<Database>(supabaseUrl, supabaseKey); // No schema specified