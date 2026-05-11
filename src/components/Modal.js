let currentModal = null;

export function showModal(content, onClose = null) {
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Dialog');
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" aria-label="Close">&times;</button>
            <div class="modal-body"></div>
        </div>
    `;
    
    const body = modal.querySelector('.modal-body');
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        body.appendChild(content);
    }
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        closeModal();
        if (onClose) onClose();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
            if (onClose) onClose();
        }
    };
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    currentModal = modal;
    
    // Focus trap
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea');
    if (focusable.length) focusable[0].focus();
}

export function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}
