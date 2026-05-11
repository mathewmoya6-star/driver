const toastContainer = document.getElementById('toast-root');
let toastQueue = [];
let isShowing = false;

export function showToast(message, type = 'info', duration = 3000) {
    toastQueue.push({ message, type, duration });
    processToastQueue();
}

async function processToastQueue() {
    if (isShowing || toastQueue.length === 0) return;
    
    isShowing = true;
    const { message, type, duration } = toastQueue.shift();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${escapeHtml(message)}`;
    toastContainer.appendChild(toast);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    toast.remove();
    isShowing = false;
    processToastQueue();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
