// Escape HTML to prevent XSS
export function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  })[m]);
}

// Show toast notification
let toastContainer = null;
export function showToast(msg, type = 'info') {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2100';
      document.body.appendChild(toastContainer);
    }
  }
  const id = Date.now();
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = `toast-${id}`;
  toast.style.cssText = 'background:#0d2137;border-left:4px solid #00ff88;padding:12px 20px;border-radius:12px;margin-top:8px;display:flex;justify-content:space-between;align-items:center;gap:12px;animation:slideIn 0.3s ease';
  toast.innerHTML = `${icons[type]} ${escapeHtml(msg)}<button onclick="closeToast(${id})" style="background:none;border:none;color:#a0b3d9;cursor:pointer;">×</button>`;
  toastContainer.appendChild(toast);
  setTimeout(() => closeToast(id), 5000);
}

window.closeToast = function(id) {
  document.getElementById(`toast-${id}`)?.remove();
};

// Format currency
export function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}

// Format date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Local storage wrapper
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// Course progress tracking
export function getLessonProgress(courseId) {
  return storage.get(`lesson_${courseId}_progress`, 0);
}

export function setLessonProgress(courseId, progress) {
  storage.set(`lesson_${courseId}_progress`, progress);
}

export function getCurrentLessonIndex(courseId) {
  return storage.get(`lesson_${courseId}_index`, 0);
}

export function setCurrentLessonIndex(courseId, index) {
  storage.set(`lesson_${courseId}_index`, index);
}
