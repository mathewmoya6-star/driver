import { apiClient } from './api/client.js';

class Store {
  constructor() {
    this.state = {
      user: null,
      userRole: 'guest',
      currentPage: 'home',
      materials: {},
      questions: {},
      progress: {},
      loading: false,
      error: null
    };
    this.listeners = [];
    this.cache = new Map();
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }
  
  async loadMaterials(moduleType, page = 1) {
    const cacheKey = `materials_${moduleType}_${page}`;
    if (this.cache.has(cacheKey)) {
      this.setState({ materials: { ...this.state.materials, [moduleType]: this.cache.get(cacheKey) } });
      return this.cache.get(cacheKey);
    }
    
    this.setState({ loading: true });
    try {
      const response = await apiClient.get(`/materials?module_type=${moduleType}&page=${page}`);
      if (response.success) {
        this.cache.set(cacheKey, response.data);
        this.setState({ materials: { ...this.state.materials, [moduleType]: response.data }, loading: false });
        return response.data;
      }
    } catch (error) {
      this.setState({ error: error.message, loading: false });
      return [];
    }
  }
  
  async loadUserProgress() {
    if (!this.state.user) return;
    try {
      const response = await apiClient.get('/progress');
      if (response.success) {
        const progressMap = {};
        response.data.forEach(p => { progressMap[p.material_id] = p.progress_percentage; });
        this.setState({ progress: progressMap });
        return progressMap;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      return {};
    }
  }
  
  async updateProgress(materialId, progress) {
    if (!this.state.user) return;
    try {
      await apiClient.post('/progress', { material_id: materialId, progress_percentage: progress });
      this.setState({ progress: { ...this.state.progress, [materialId]: progress } });
      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  }
  
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.success) {
        localStorage.setItem('token', response.token);
        this.setState({ user: response.user, userRole: response.user.role });
        await this.loadUserProgress();
        return response.user;
      }
    } catch (error) {
      this.setState({ error: error.message });
      throw error;
    }
  }
  
  async logout() {
    localStorage.removeItem('token');
    this.setState({ user: null, userRole: 'guest', progress: {} });
    await apiClient.post('/auth/logout');
  }
  
  hasRole(requiredRole) {
    const roleHierarchy = { guest: 0, user: 1, learner: 1, driver: 2, admin: 3, super_admin: 4 };
    return roleHierarchy[this.state.userRole] >= roleHierarchy[requiredRole];
  }
  
  clearCache() { this.cache.clear(); }
}

export const store = new Store();
