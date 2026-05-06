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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ name: 'MEI DRIVE AFRICA API', status: 'running' });
});

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
    localUsers.push({ id: userId, email: email, password: password });
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
        user: { id: user.id, email: email, name: email.split('@')[0] },
        token: token
    });
});

// Get users list
app.get('/users', (req, res) => {
    res.json({ total: localUsers.length, users: localUsers.map(u => ({ email: u.email })) });
});

// Profile
app.get('/profile/:userId', (req, res) => {
    const user = localUsers.find(u => u.id === req.params.userId);
    res.json({ name: user?.name || '', phone: user?.phone || '' });
});

app.post('/profile', (req, res) => {
    const { id, name, phone } = req.body;
    const userIndex = localUsers.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
        localUsers[userIndex].name = name || '';
        localUsers[userIndex].phone = phone || '';
        saveUsers();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Progress
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});