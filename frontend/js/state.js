// Centralized state management with event listeners
class AppState {
    constructor() {
        this.state = {
            currentUser: null,
            currentPage: 'home',
            currentUnit: null,
            currentLesson: null,
            examMode: null, // 'practice', 'timed', 'mock'
            examQuestions: [],
            examAnswers: [],
            examTimeRemaining: 0,
            userProgress: { units: {}, answers: [], quizHistory: [] },
            allContent: {
                units: [],
                courses: [],
                questions: []
            },
            isLoading: false,
            notifications: []
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
    }
    
    // Subscribe to state changes
    subscribe(key, callback, id) {
        if (!this.listeners.has(key)) this.listeners.set(key, new Map());
        this.listeners.get(key).set(id, callback);
        return () => this.unsubscribe(key, id);
    }
    
    unsubscribe(key, id) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(id);
        }
    }
    
    // Notify subscribers
    notify(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(value));
        }
    }
    
    // Set state with reactivity
    setState(key, value, silent = false) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        if (!silent && JSON.stringify(oldValue) !== JSON.stringify(value)) {
            this.notify(key, value);
            this.saveToStorage();
        }
    }
    
    getState(key) {
        return this.state[key];
    }
    
    // Persist to localStorage
    saveToStorage() {
        try {
            const toSave = {
                currentUser: this.state.currentUser,
                userProgress: this.state.userProgress,
                examMode: this.state.examMode
            };
            localStorage.setItem('mei_app_state', JSON.stringify(toSave));
        } catch (e) {}
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('mei_app_state');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.currentUser) this.state.currentUser = data.currentUser;
                if (data.userProgress) this.state.userProgress = data.userProgress;
            }
        } catch (e) {}
    }
    
    // Clear state
    clear() {
        this.state.currentUser = null;
        this.state.userProgress = { units: {}, answers: [], quizHistory: [] };
        this.state.examMode = null;
        this.saveToStorage();
        this.notify('currentUser', null);
        this.notify('userProgress', this.state.userProgress);
    }
}

// Global instance
window.appState = new AppState();
