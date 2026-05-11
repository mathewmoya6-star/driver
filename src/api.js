import { CONFIG } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Cache storage
const cache = new Map();

// Create Supabase client (only once)
let supabaseInstance = null;

function getSupabaseClient() {
    if (!supabaseInstance) {
        supabaseInstance = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return supabaseInstance;
}

// Retry logic with exponential backoff
async function retry(fn, retries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}

// Generic API call with timeout
async function apiCall(promise, timeout = CONFIG.API_TIMEOUT) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
    return Promise.race([promise, timeoutPromise]);
}

// Fetch materials with caching
export async function fetchMaterials(moduleType, page = 1, forceRefresh = false) {
    const cacheKey = `materials_${moduleType}_${page}`;
    
    if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
            return cached.data;
        }
    }
    
    const supabase = getSupabaseClient();
    const start = (page - 1) * CONFIG.ITEMS_PER_PAGE;
    
    const result = await retry(async () => {
        return await apiCall(
            supabase
                .from('materials')
                .select('*')
                .eq('module_type', moduleType)
                .eq('status', 'published')
                .order('unit_number', { ascending: true })
                .range(start, start + CONFIG.ITEMS_PER_PAGE - 1)
        );
    });
    
    if (result.error) throw result.error;
    
    cache.set(cacheKey, {
        data: result.data || [],
        timestamp: Date.now()
    });
    
    return result.data || [];
}

// Fetch single material
export async function fetchMaterialById(id) {
    const supabase = getSupabaseClient();
    
    const result = await retry(async () => {
        return await apiCall(
            supabase.from('materials').select('*').eq('id', id).single()
        );
    });
    
    if (result.error) throw result.error;
    return result.data;
}

// Fetch questions
export async function fetchQuestions(moduleType, limit = 20) {
    const cacheKey = `questions_${moduleType}`;
    
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
            return cached.data;
        }
    }
    
    const supabase = getSupabaseClient();
    
    const result = await retry(async () => {
        return await apiCall(
            supabase
                .from('questions')
                .select('*')
                .eq('module_type', moduleType)
                .limit(limit)
        );
    });
    
    if (result.error) throw result.error;
    
    cache.set(cacheKey, {
        data: result.data || [],
        timestamp: Date.now()
    });
    
    return result.data || [];
}

// Save user progress
export async function saveProgress(userId, materialId, progress, status) {
    const supabase = getSupabaseClient();
    
    const result = await retry(async () => {
        return await apiCall(
            supabase.from('user_progress').upsert({
                user_id: userId,
                material_id: materialId,
                progress_percentage: progress,
                status: status,
                last_accessed_at: new Date().toISOString(),
                completed_at: progress === 100 ? new Date().toISOString() : null
            })
        );
    });
    
    if (result.error) throw result.error;
    return result.data;
}

// Clear cache (useful for logout)
export function clearCache() {
    cache.clear();
}
