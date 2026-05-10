// Centralized Store with Observer Pattern
class Store {
  constructor() {
    this.state = {
      user: null,
      isLoading: false,
      units: [],
      questions: [],
      progress: { units: {}, answers: [], exam_history: [] },
      currentExam: null,
      notifications: []
    };
    
    this.listeners = new Map();
    this.loadFromStorage();
  }

  subscribe(key, callback, id) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Map());
    this.listeners.get(key).set(id, callback);
    return () => this.listeners.get(key)?.delete(id);
  }

  notify(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => callback(value));
    }
  }

  set(key, value, silent = false) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    if (!silent && JSON.stringify(oldValue) !== JSON.stringify(value)) {
      this.notify(key, value);
      this.persist(key, value);
    }
  }

  get(key) {
    return this.state[key];
  }

  persist(key, value) {
    if (key === 'user' || key === 'progress') {
      localStorage.setItem(`mei_${key}`, JSON.stringify(value));
    }
  }

  loadFromStorage() {
    try {
      const savedUser = localStorage.getItem('mei_user');
      if (savedUser) this.state.user = JSON.parse(savedUser);
      
      const savedProgress = localStorage.getItem('mei_progress');
      if (savedProgress) this.state.progress = JSON.parse(savedProgress);
    } catch (e) {}
  }

  async loadInitialData() {
    this.set('isLoading', true);
    
    try {
      const [units, questions] = await Promise.all([
        window.api.getUnits(),
        window.api.getQuestions()
      ]);
      
      this.set('units', units);
      this.set('questions', questions);
      
      // If user is logged in, load their progress
      if (this.state.user) {
        const progress = await window.api.getProgress();
        this.set('progress', progress);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      window.showToast?.('Failed to load content', 'error');
    } finally {
      this.set('isLoading', false);
    }
  }
}

window.store = new Store();
