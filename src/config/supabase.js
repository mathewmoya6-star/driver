import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
