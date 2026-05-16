import express from 'express';
import session from 'express-session';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (where ESBuild puts everything)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Serving static files from ${distPath}`);
} else {
  console.warn(`⚠️ dist folder not found at ${distPath}`);
}

// Also serve public folder for images if needed
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use('/public', express.static(publicPath));
}

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        httpOnly: true
    }
}));

// Database connection
let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'login_system',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('✅ Database connected');
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
}

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/login', (req, res) => {
    const loginPath = path.join(distPath, 'login.html');
    if (fs.existsSync(loginPath)) {
        res.sendFile(loginPath);
    } else {
        // Fallback HTML if file not found
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Login</title></head>
            <body>
                <h2>Login Page</h2>
                <form id="loginForm">
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <div id="error"></div>
                <script>
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                email: document.getElementById('email').value,
                                password: document.getElementById('password').value
                            })
                        });
                        const data = await response.json();
                        if (data.success) {
                            window.location.href = data.redirect;
                        } else {
                            document.getElementById('error').textContent = data.error;
                        }
                    });
                </script>
            </body>
            </html>
        `);
    }
});

app.get('/admin-dashboard', (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.redirect('/login');
    }
    const adminPath = path.join(distPath, 'admin.html');
    if (fs.existsSync(adminPath)) {
        res.sendFile(adminPath);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Admin Dashboard</title></head>
            <body>
                <h1>Welcome Admin: ${req.session.fullname}</h1>
                <button onclick="logout()">Logout</button>
                <script>
                    async function logout() {
                        await fetch('/api/logout', {method: 'POST'});
                        window.location.href = '/login';
                    }
                </script>
            </body>
            </html>
        `);
    }
});

app.get('/user-dashboard', (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.redirect('/login');
    }
    const userPath = path.join(distPath, 'user.html');
    if (fs.existsSync(userPath)) {
        res.sendFile(userPath);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>User Dashboard</title></head>
            <body>
                <h1>Welcome User: ${req.session.fullname}</h1>
                <button onclick="logout()">Logout</button>
                <script>
                    async function logout() {
                        await fetch('/api/logout', {method: 'POST'});
                        window.location.href = '/login';
                    }
                </script>
            </body>
            </html>
        `);
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email not found' });
        }
        
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        req.session.userId = user.id;
        req.session.fullname = user.fullname;
        req.session.role = user.role;
        
        res.json({ 
            success: true, 
            role: user.role,
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/current-user', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            fullname: req.session.fullname,
            role: req.session.role,
            userId: req.session.userId
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║     🚗 MEI DRIVE AFRICA - Server Running                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  📍 Local:    http://localhost:${PORT}                        ║
    ║  🔒 Session:  Enabled                                     ║
    ║  📦 Mode:     ${process.env.NODE_ENV || 'development'}                             ║
    ╚══════════════════════════════════════════════════════════╝
    `);
});
