// Complete authentication system with Supabase
class AuthManager {
    constructor() {
        this.supabase = null;
        this.init();
    }
    
    async init() {
        this.supabase = await window.getSupabase();
        this.setupAuthListener();
    }
    
    setupAuthListener() {
        if (!this.supabase) return;
        
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.handleSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
        
        // Check existing session
        this.checkSession();
    }
    
    async checkSession() {
        if (!this.supabase) return;
        
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.user) {
            this.handleSignIn(session.user);
        }
    }
    
    async handleSignIn(user) {
        const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0],
            role: user.user_metadata?.role || 'learner',
            createdAt: user.created_at
        };
        
        window.appState.setState('currentUser', userData);
        await this.loadUserProgress(user.id);
        
        window.showToast(`Welcome back, ${userData.name}!`, 'success');
        window.navigateTo('learner');
    }
    
    handleSignOut() {
        window.appState.clear();
        window.showToast('Logged out successfully', 'info');
        window.navigateTo('home');
    }
    
    async signUp(email, password, name) {
        if (!this.supabase) {
            window.showToast('Supabase not configured. Using demo mode.', 'warning');
            this.demoSignIn(name, email);
            return;
        }
        
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, role: 'learner' }
                }
            });
            
            if (error) throw error;
            
            window.showToast('Account created! Please check your email to verify.', 'success');
            return true;
        } catch (error) {
            window.showToast(error.message, 'error');
            return false;
        }
    }
    
    async signIn(email, password) {
        if (!this.supabase) {
            window.showToast('Supabase not configured. Using demo mode.', 'warning');
            this.demoSignIn('Demo User', email);
            return true;
        }
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return true;
        } catch (error) {
            window.showToast(error.message, 'error');
            return false;
        }
    }
    
    demoSignIn(name, email) {
        const demoUser = {
            id: 'demo_' + Date.now(),
            email: email,
            name: name,
            role: 'learner',
            isDemo: true
        };
        window.appState.setState('currentUser', demoUser);
        window.navigateTo('learner');
        window.showToast('Demo mode: Progress saved locally only', 'info');
    }
    
    async signOut() {
        if (this.supabase) {
            await this.supabase.auth.signOut();
        } else {
            this.handleSignOut();
        }
    }
    
    async loadUserProgress(userId) {
        if (!this.supabase) {
            // Load from localStorage
            const saved = localStorage.getItem(`progress_${userId}`);
            if (saved) {
                window.appState.setState('userProgress', JSON.parse(saved));
            }
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (data) {
                window.appState.setState('userProgress', {
                    units: data.units_progress || {},
                    answers: data.answers_history || [],
                    quizHistory: data.quiz_history || []
                });
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
    
    async saveUserProgress() {
        const user = window.appState.getState('currentUser');
        if (!user) return;
        
        const progress = window.appState.getState('userProgress');
        
        if (!this.supabase || user.isDemo) {
            localStorage.setItem(`progress_${user.id}`, JSON.stringify(progress));
            return;
        }
        
        try {
            await this.supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    units_progress: progress.units,
                    answers_history: progress.answers,
                    quiz_history: progress.quizHistory,
                    updated_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
}

// Initialize
window.authManager = new AuthManager();
