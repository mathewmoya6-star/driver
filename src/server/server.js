const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../dist')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 } // 1 hour
}));

// Serve HTML pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../../views/admin.html'));
});

app.get('/user-dashboard', (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../../views/user.html'));
});

// Login API endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email not found' });
        }
        
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Set session
        req.session.userId = user.id;
        req.session.fullname = user.fullname;
        req.session.role = user.role;
        
        res.json({ 
            success: true, 
            role: user.role,
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/current-user', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            fullname: req.session.fullname,
            role: req.session.role
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
