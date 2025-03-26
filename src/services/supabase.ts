import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvucfqzldbcghtxddtmq.supabase.co'; // Your Supabase project URL
const supabaseAnonKey = 'your-anon-key'; // Your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);