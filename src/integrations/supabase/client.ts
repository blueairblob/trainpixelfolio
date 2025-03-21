
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const SUPABASE_URL = "https://tvucfqzldbcghtxddtmq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dWNmcXpsZGJjZ2h0eGRkdG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODk4OTcsImV4cCI6MjA1NTU2NTg5N30.5p5Gq-Q2PPaJfTQKrzVGwh8fGHBd8dM8HYnii1O3sQw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  }
});
