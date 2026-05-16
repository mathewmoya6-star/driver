import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Backend is running!'
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, passwordReceived: !!password });
    
    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Email and password are required' 
        });
    }
    
    // Temporary response - will connect to Supabase later
    res.json({ 
        success: true, 
        message: 'Login endpoint working!',
        email: email 
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Test health: http://localhost:${PORT}/api/health`);
    console.log(`📍 Test login: http://localhost:${PORT}/api/login`);
});
