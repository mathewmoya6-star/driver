// Environment variables (injected at build time)
export const CONFIG = {
    SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || 'https://fktjmkmzlixlapeyhhyl.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
    APP_URL: import.meta.env?.VITE_APP_URL || window.location.origin,
    APP_NAME: 'MEI DRIVE AFRICA',
    API_TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    ITEMS_PER_PAGE: 12,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
};

// Validate required config
if (!CONFIG.SUPABASE_ANON_KEY && !import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ SUPABASE_ANON_KEY not set. Some features may not work.');
}
