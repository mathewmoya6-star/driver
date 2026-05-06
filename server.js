const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Local users storage
let localUsers = [];

// Load existing users from file
try {
    if (fs.existsSync('./users.json')) {
        const data = fs.readFileSync('./users.json', 'utf8');
        localUsers = JSON.parse(data);
        console.log(`📁 Loaded ${localUsers.length} existing users`);
    }
} catch(e) { 
    console.log('No existing users file, starting fresh');
}

function saveUsers() {
    fs.writeFileSync('./users.json', JSON.stringify(localUsers, null, 2));
    console.log('💾 Users saved to file');
}

app.use(cors());
app.use(express.json());

console.log('🚀 MEI DRIVE API Starting (Local Only - No Supabase)');
console.log('=' .repeat(50));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), message: 'Server is running!' });
});

app.get('/', (req, res) => {
    res.json({ name: 'MEI DRIVE AFRICA API', status: 'running', users: localUsers.length });
});

// REGISTER - Local only
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('📝 Register request:', email);
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if email already exists
    const existingUser = localUsers.find(u => u.email === email);
    if (existingUser) {
        console.log('❌ Email already exists:', email);
        return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user
    const userId = Date.now().toString();
    const newUser = {
        id: userId,
        email: email,
        password: password,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    
    localUsers.push(newUser);
    saveUsers();
    
    console.log('✅ User registered successfully:', email);
    
    // Create JWT token
    const token = jwt.sign(
        { id: userId, email: email },
        'mei_drive_secret_key_2026',
        { expiresIn: '7d' }
    );
    
    res.json({
        success: true,
        message: 'Account created successfully',
        user: {
            id: userId,
            email: email,
            name: email.split('@')[0]
        },
        token: token
    });
});

// LOGIN - Local only
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const user = localUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        console.log('❌ Login failed for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ User logged in:', email);
    
    const token = jwt.sign(
        { id: user.id, email: email },
        'mei_drive_secret_key_2026',
        { expiresIn: '7d' }
    );
    
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: user.id,
            email: email,
            name: user.name || email.split('@')[0]
        },
        token: token
    });
});

// Get users list (for testing)
app.get('/users', (req, res) => {
    res.json({ total: localUsers.length, users: localUsers.map(u => ({ email: u.email, id: u.id })) });
});

// Profile endpoints
app.get('/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const user = localUsers.find(u => u.id === userId);
    
    if (user) {
        res.json({ name: user.name || '', phone: user.phone || '' });
    } else {
        res.json({ name: '', phone: '' });
    }
});

app.post('/profile', (req, res) => {
    const { id, name, phone } = req.body;
    const userIndex = localUsers.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
        localUsers[userIndex].name = name || '';
        localUsers[userIndex].phone = phone || '';
        saveUsers();
        console.log('💾 Profile saved for:', localUsers[userIndex].email);
        res.json({ success: true, message: 'Profile saved' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Progress endpoints
const userProgress = {};

app.get('/progress/:type', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({});
    }
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'mei_drive_secret_key_2026');
        const key = `${decoded.id}_${req.params.type}`;
        res.json(userProgress[key] || {});
    } catch(e) {
        res.json({});
    }
});

app.post('/progress/:type', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'mei_drive_secret_key_2026');
        const key = `${decoded.id}_${req.params.type}`;
        userProgress[key] = req.body.data || {};
        console.log('💾 Progress saved for user:', decoded.email);
        res.json({ success: true });
    } catch(e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('=' .repeat(50));
    console.log('✅ MEI DRIVE AFRICA API IS RUNNING!');
    console.log('=' .repeat(50));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Register: POST http://localhost:${PORT}/auth/register`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/auth/login`);
    console.log(`📊 Users: http://localhost:${PORT}/users`);
    console.log('=' .repeat(50));
    console.log('🚀 Server is ready! No Supabase dependency!');
});