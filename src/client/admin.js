async function loadUserInfo() {
    try {
        const response = await fetch('/api/current-user');
        const data = await response.json();
        
        if (data.loggedIn) {
            document.getElementById('username').textContent = data.fullname;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
}

loadUserInfo();
