// Supabase client configuration
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

let supabase = null;

async function initSupabase() {
    if (typeof window === 'undefined') return null;
    
    if (window.supabase && !supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

async function getSupabase() {
    if (!supabase) await initSupabase();
    return supabase;
}

// Export for use
window.getSupabase = getSupabase;
window.supabaseClient = supabase;
