const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Local users storage
let localUsers = [];

// Load existing users
try {
    if (fs.existsSync('./users.json')) {
        const data = fs.readFileSync('./users.json', 'utf8');
        localUsers = JSON.parse(data);
        console.log(`📁 Loaded ${localUsers.length} users`);
    }
} catch(e) { 
    console.log('No existing users');
}

function saveUsers() {
    fs.writeFileSync('./users.json', JSON.stringify(localUsers, null, 2));
}

app.use(cors());
app.use(express.json());

console.log('🚀 MEI DRIVE API Starting...');
console.log('='.repeat(50));

// ==================== HEALTH & ROOT ====================
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ name: 'MEI DRIVE AFRICA API', status: 'running' });
});

// ==================== AUTH ENDPOINTS ====================

// REGISTER
app.post('/auth/register', (req, res) => {
    const { email, password } = req.body;
    
    console.log('📝 Register:', email);
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = localUsers.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    
    const userId = Date.now().toString();
    localUsers.push({ 
        id: userId, 
        email: email, 
        password: password,
        name: '',
        phone: '',
        createdAt: new Date().toISOString()
    });
    saveUsers();
    
    const token = jwt.sign(
        { id: userId, email: email },
        'mei_drive_secret',
        { expiresIn: '7d' }
    );
    
    res.json({
        success: true,
        user: { id: userId, email: email, name: email.split('@')[0] },
        token: token
    });
});

// LOGIN
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login:', email);
    
    const user = localUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
        { id: user.id, email: email },
        'mei_drive_secret',
        { expiresIn: '7d' }
    );
    
    res.json({
        success: true,
        user: { id: user.id, email: email, name: user.name || email.split('@')[0] },
        token: token
    });
});

// ==================== USER ENDPOINTS ====================

// Get all users (for admin)
app.get('/users', (req, res) => {
    const safeUsers = localUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || '',
        phone: u.phone || '',
        createdAt: u.createdAt
    }));
    res.json({ total: safeUsers.length, users: safeUsers });
});

// Get single user profile
app.get('/profile/:userId', (req, res) => {
    const user = localUsers.find(u => u.id === req.params.userId);
    res.json({ name: user?.name || '', phone: user?.phone || '' });
});

// Save profile
app.post('/profile', (req, res) => {
    const { id, name, phone } = req.body;
    const userIndex = localUsers.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
        if (name !== undefined) localUsers[userIndex].name = name || '';
        if (phone !== undefined) localUsers[userIndex].phone = phone || '';
        saveUsers();
        res.json({ success: true, message: 'Profile saved' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ==================== PROGRESS ENDPOINTS ====================

// Progress storage
const userProgress = {};

app.get('/progress/:type', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({});
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'mei_drive_secret');
        const key = `${decoded.id}_${req.params.type}`;
        res.json(userProgress[key] || {});
    } catch(e) {
        res.json({});
    }
});

app.post('/progress/:type', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'mei_drive_secret');
        const key = `${decoded.id}_${req.params.type}`;
        userProgress[key] = req.body.data || {};
        res.json({ success: true });
    } catch(e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin stats
app.get('/stats', (req, res) => {
    const totalUsers = localUsers.length;
    let totalCompletedUnits = 0;
    
    // Calculate total completed units across all users
    for (let key in userProgress) {
        const progress = userProgress[key];
        if (progress && typeof progress === 'object') {
            totalCompletedUnits += Object.values(progress).filter(v => v === 100).length;
        }
    }
    
    const avgProgress = totalUsers > 0 ? Math.floor((totalCompletedUnits / (totalUsers * 21)) * 100) : 0;
    
    res.json({
        totalUsers: totalUsers,
        totalCompletedUnits: totalCompletedUnits,
        avgProgress: avgProgress + '%',
        totalQuestions: 50
    });
});

// Admin delete user
app.delete('/admin/user/:userId', (req, res) => {
    const { userId } = req.params;
    const userIndex = localUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        localUsers.splice(userIndex, 1);
        saveUsers();
        res.json({ success: true, message: 'User deleted' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ MEI DRIVE API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`👥 Users: http://localhost:${PORT}/users`);
    console.log(`📊 Stats: http://localhost:${PORT}/stats`);
});