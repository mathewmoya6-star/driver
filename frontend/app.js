// API Service Layer - Single source of truth for all backend calls
class APIService {
  constructor() {
    this.baseURL = '';
    this.session = null;
  }

  setSession(session) {
    this.session = session;
    if (session?.access_token) {
      localStorage.setItem('supabase_token', session.access_token);
    }
  }

  getHeaders() {
    const token = this.session?.access_token || localStorage.getItem('supabase_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async signUp(email, password, name) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.session) {
      this.setSession(data.session);
    }
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.session = null;
    localStorage.removeItem('supabase_token');
  }

  // Content endpoints
  async getUnits() {
    return this.request('/api/content/units');
  }

  async getQuestions(category = 'all', limit = 50) {
    return this.request(`/api/content/questions?category=${category}&limit=${limit}`);
  }

  // Exam endpoints
  async generateExam(mode, category, questionCount) {
    return this.request('/api/exam/generate', {
      method: 'POST',
      body: JSON.stringify({ mode, category, questionCount })
    });
  }

  async submitExam(sessionId, answers) {
    return this.request('/api/exam/submit', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, answers })
    });
  }

  // Progress endpoints
  async getProgress() {
    return this.request('/api/progress');
  }

  async updateProgress(unitId, completed, lessonId, quizScore) {
    return this.request('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ unit_id: unitId, completed, lesson_id: lessonId, quiz_score: quizScore })
    });
  }
}

window.api = new APIService();
