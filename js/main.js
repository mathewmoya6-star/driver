// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    await initSupabase();
    await loadFeaturedCourses();
    
    // Get started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.onclick = () => {
            if (isAuthenticated()) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'login.html';
            }
        };
    }
});

async function loadFeaturedCourses() {
    const container = document.getElementById('featuredCourses');
    if (!container) return;
    
    const featured = coursesData.slice(0, 3);
    container.innerHTML = featured.map(course => `
        <div class="card" onclick="window.location.href='course-detail.html?id=${course.id}'">
            <i class="fas ${course.icon}" style="font-size: 2rem; color: var(--primary);"></i>
            <h3>${escapeHtml(course.name)}</h3>
            <p>${escapeHtml(course.description)}</p>
            <div class="module-price">${course.price === 0 ? 'FREE' : `KES ${course.price.toLocaleString()}`}</div>
            <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Enroll Now</button>
        </div>
    `).join('');
}
