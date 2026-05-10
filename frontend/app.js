// Main application entry point
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    await window.initSupabase?.();
    await window.learnerManager?.loadUnits();
    
    // Render initial view
    renderHome();
    
    // Setup navigation
    setupNavigation();
    
    // Load user data if logged in
    const user = window.appState?.getState('currentUser');
    if (user) {
        await window.authManager?.loadUserProgress(user.id);
    }
});

function setupNavigation() {
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        const page = event.state?.page || 'home';
        navigateTo(page);
    });
}

function navigateTo(page, params = {}) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Show selected view
    const viewMap = {
        'home': 'homeView',
        'learner': 'learnerView',
        'psv': 'psvView',
        'boda': 'bodaView',
        'school': 'schoolView',
        'academy': 'academyView',
        'library': 'libraryView',
        'exam': 'examView',
        'unit': 'unitView',
        'lesson': 'lessonView',
        'quiz': 'quizView'
    };
    
    const viewId = viewMap[page];
    if (viewId) {
        const view = document.getElementById(viewId);
        if (view) view.style.display = 'block';
    }
    
    // Update URL
    history.pushState({ page }, '', `#${page}`);
    
    // Render specific content
    switch(page) {
        case 'learner':
            renderLearnerModules();
            break;
        case 'exam':
            if (params.mode) {
                window.examSystem?.startExam(params.mode);
            }
            break;
    }
}

function renderHome() {
    const container = document.getElementById('homeModules');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid">
            ${modules.map(m => `
                <div class="card" onclick="navigateTo('${m.id}')">
                    <i class="fas ${m.icon}" style="font-size: 2rem; color: #d4af37;"></i>
                    <h3>${m.name}</h3>
                    <p>${m.desc}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLearnerModules() {
    const units = window.appState.getState('allContent')?.units || [];
    const container = document.getElementById('learnerModulesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="modules-grid">
            ${units.map(unit => {
                const progress = window.appState.getState('userProgress')?.units[unit.id]?.score || 0;
                return `
                    <div class="module-card" onclick="window.learnerManager.openUnit(${unit.id})">
                        <h3>${unit.title}</h3>
                        <p>${unit.description}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span>${progress}% complete</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Make global
window.navigateTo = navigateTo;
window.renderHome = renderHome;
window.renderLearnerModules = renderLearnerModules;
