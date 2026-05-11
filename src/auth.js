import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from './config.js';
import { clearCache } from './api.js';
import { showToast } from './components/Toast.js';

let supabase = null;
let sessionRefreshInterval = null;

function getSupabase() {
    if (!supabase) {
        supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return supabase;
}

// Auto-refresh session
async function refreshSession() {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        stopSessionRefresh();
        return null;
    }
    
    // Refresh if token expires in less than 10 minutes
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeToExpiry = expiresAt - now;
    
    if (timeToExpiry < 10 * 60 * 1000) {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            stopSessionRefresh();
            return null;
        }
        return data.session;
    }
    return session;
}

export function startSessionRefresh() {
    if (sessionRefreshInterval) clearInterval(sessionRefreshInterval);
    sessionRefreshInterval = setInterval(async () => {
        await refreshSession();
    }, 5 * 60 * 1000); // Check every 5 minutes
}

export function stopSessionRefresh() {
    if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval);
        sessionRefreshInterval = null;
    }
}

export async function signUp(email, password, name) {
    const supabase = getSupabase();
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: { data: { full_name: name.trim() } }
        });
        
        if (error) throw error;
        showToast('Sign up successful! Please verify your email.', 'success');
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

export async function login(email, password) {
    const supabase = getSupabase();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });
        
        if (error) throw error;
        
        const user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || email.split('@')[0]
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        startSessionRefresh();
        showToast(`Welcome back, ${user.name}!`, 'success');
        return user;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

export async function logout() {
    const supabase = getSupabase();
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('currentUser');
        clearCache();
        stopSessionRefresh();
        showToast('Logged out successfully', 'info');
        return true;
    } catch (error) {
        showToast('Error logging out', 'error');
        return false;
    }
}

export async function getCurrentUser() {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        return null;
    }
    
    const stored = localStorage.getItem('currentUser');
    if (stored) return JSON.parse(stored);
    
    const user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    startSessionRefresh();
    return user;
}
