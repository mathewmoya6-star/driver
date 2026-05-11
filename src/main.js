import { store } from './store.js';
import { sanitizeHtml, sanitizeText } from './utils/sanitize.js';
import { showToast } from './components/Toast.js';
import { showModal, closeModal } from './components/Modal.js';
import { renderHome, renderLearner, renderPSV, renderSchoolBus, renderEV, renderBoda, renderAcademy, renderLibrary, renderAdmin } from './pages/index.js';

const pageRenderers = {
  home: renderHome,
  learner: renderLearner,
  psv: renderPSV,
  schoolbus: renderSchoolBus,
  ev: renderEV,
  boda: renderBoda,
  academy: renderAcademy,
  library: renderLibrary,
  admin: renderAdmin
};

class App {
  constructor() {
    this.currentPage = 'home';
    this.container = document.getElementById('page-content');
    this.init();
  }
  
  async init() {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await apiClient.get('/auth/verify');
        if (response.success) {
          store.setState({ user: response.user, userRole: response.user.role });
          await store.loadUserProgress();
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    
    // Subscribe to state changes
    store.subscribe((state) => {
      this.updateAuthUI(state);
    });
    
    // Setup navigation
    this.setupNavigation();
    this.setupMobileMenu();
    
    // Handle initial route
    const initialPage = window.location.pathname.slice(1) || 'home';
    await this.navigateTo(initialPage);
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state?.page) this.navigateTo(e.state.page, false);
    });
  }
  
  async navigateTo(page, pushState = true) {
    const validPages = ['home', 'learner', 'psv', 'schoolbus', 'boda', 'ev', 'academy', 'library', 'admin'];
    if (!validPages.includes(page)) page = 'home';
    
    // Check admin access
    if (page === 'admin' && !store.hasRole('admin')) {
      showToast('Admin access required', 'error');
      page = 'home';
    }
    
    this.currentPage = page;
    this.container.innerHTML = '<div class="spinner"></div>';
    
    if (pushState) {
      history.pushState({ page }, '', `/${page === 'home' ? '' : page}`);
    }
    
    try {
      const renderer = pageRenderers[page];
      const html = await renderer();
      this.container.innerHTML = html;
      this.attachEventListeners();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      this.container.innerHTML = `<div class="error-state">❌ Error loading page: ${error.message}</div>`;
      showToast('Error loading page', 'error');
    }
  }
  
  attachEventListeners() {
    // Card clicks
    this.container.querySelectorAll('[data-material-id]').forEach(el => {
      el.addEventListener('click', () => this.viewMaterial(el.dataset.materialId));
    });
    
    // Navigation buttons
    this.container.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => this.navigateTo(el.dataset.nav));
    });
    
    // Question answers
    this.container.querySelectorAll('.option[data-question-id]').forEach(el => {
      el.addEventListener('click', () => {
        const isCorrect = parseInt(el.dataset.selected) === parseInt(el.dataset.correct);
        const targetClass = isCorrect ? 'correct' : 'wrong';
        el.classList.add(targetClass);
        showToast(isCorrect ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${String.fromCharCode(64 + parseInt(el.dataset.correct))}`, isCorrect ? 'success' : 'error');
      });
    });
  }
  
  async viewMaterial(id) {
    this.container.innerHTML = '<div class="spinner"></div>';
    try {
      const response = await apiClient.get(`/materials/${id}`);
      if (!response.success) throw new Error('Failed to load');
      
      const material = response.data;
      const progress = store.state.progress[id] || 0;
      
      this.container.innerHTML = `
        <div style="background:var(--card-bg);border-radius:24px;padding:24px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
            <h2 style="color:var(--primary-gold);">${sanitizeText(material.title)}</h2>
            <button class="btn-small" data-back>← Back</button>
          </div>
          ${material.image_url ? `<img src="${material.image_url}" alt="${sanitizeText(material.title)}" style="width:100%;max-height:400px;object-fit:cover;border-radius:16px;margin-bottom:24px;" loading="lazy">` : ''}
          <p>${sanitizeText(material.description)}</p>
          ${material.content ? `<div class="mt-3">${sanitizeHtml(material.content)}</div>` : ''}
          ${material.video_url ? `<div class="video-container mt-3"><iframe src="${material.video_url}" frameborder="0" allowfullscreen></iframe></div>` : ''}
          <div class="progress-bar mt-4"><div class="progress-fill" style="width:${progress}%"></div></div>
          <button class="btn" style="width:100%;margin-top:20px;" data-complete>${progress === 100 ? '✅ Completed' : '📖 Mark Complete'}</button>
        </div>
      `;
      
      this.container.querySelector('[data-back]')?.addEventListener('click', () => this.navigateTo(this.currentPage));
      this.container.querySelector('[data-complete]')?.addEventListener('click', async () => {
        if (progress === 100) {
          showToast('Already completed!', 'info');
          return;
        }
        await store.updateProgress(id, 100);
        showToast('Unit completed! 🎉', 'success');
        this.viewMaterial(id);
      });
    } catch (error) {
      this.container.innerHTML = `<div class="error-state">❌ Error loading material</div>`;
      showToast('Error loading material', 'error');
    }
  }
  
  updateAuthUI(state) {
    const authDiv = document.getElementById('authButtons');
    if (!authDiv) return;
    
    if (state.user) {
      authDiv.innerHTML = `
        <div style="background:#d4af37;color:#000;padding:8px 16px;border-radius:40px;font-size:14px;">👤 ${sanitizeText(state.user.name)}</div>
        ${store.hasRole('admin') ? '<button data-admin class="admin-btn">🛡️ Admin</button>' : ''}
        <button data-logout>🚪 Logout</button>
      `;
      authDiv.querySelector('[data-logout]')?.addEventListener('click', async () => {
        await store.logout();
        this.navigateTo('home');
      });
      authDiv.querySelector('[data-admin]')?.addEventListener('click', () => this.navigateTo('admin'));
    } else {
      authDiv.innerHTML = '<button data-login>🔑 Login</button>';
      authDiv.querySelector('[data-login]')?.addEventListener('click', () => this.showLoginModal());
    }
  }
  
  showLoginModal() {
    showModal(`
      <h3>🔐 Login to MEI Drive Africa</h3>
      <input type="email" id="loginEmail" placeholder="Email" autocomplete="email">
      <input type="password" id="loginPassword" placeholder="Password" autocomplete="current-password">
      <button class="btn" id="loginBtn" style="width:100%;margin-top:10px;">Login</button>
      <hr style="margin:16px 0;">
      <h4>📝 Create Account</h4>
      <input type="text" id="signupName" placeholder="Full Name">
      <input type="email" id="signupEmail" placeholder="Email">
      <input type="password" id="signupPassword" placeholder="Password">
      <button class="btn-outline" id="signupBtn" style="width:100%;margin-top:10px;">Create Account</button>
    `);
    
    document.getElementById('loginBtn')?.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;
      try {
        await store.login(email, password);
        closeModal();
        this.navigateTo('home');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
    
    document.getElementById('signupBtn')?.addEventListener('click', async () => {
      const name = document.getElementById('signupName')?.value;
      const email = document.getElementById('signupEmail')?.value;
      const password = document.getElementById('signupPassword')?.value;
      try {
        const response = await apiClient.post('/auth/register', { name, email, password });
        if (response.success) {
          showToast('Account created! Please login.', 'success');
          closeModal();
        }
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }
  
  setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(el.dataset.nav);
      });
    });
  }
  
  setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    mobileBtn?.addEventListener('click', () => navLinks?.classList.toggle('show'));
    document.addEventListener('click', (e) => {
      if (navLinks?.classList.contains('show') && !navLinks.contains(e.target) && !mobileBtn?.contains(e.target)) {
        navLinks.classList.remove('show');
      }
    });
  }
}

// Initialize app
const app = new App();
window.app = app;
