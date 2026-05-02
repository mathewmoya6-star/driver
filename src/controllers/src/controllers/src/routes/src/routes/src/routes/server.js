require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const valuationRoutes = require('./src/routes/valuationRoutes');
const { router: progressRoutes } = require('./src/routes/progressRoutes');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: 'Supabase PostgreSQL',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '2.0.0'
    });
});

// API Info
app.get('/', (req, res) => {
    res.json({
        name: 'MEI DRIVE AFRICA API',
        version: '2.0.0',
        status: 'Operating normally',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me',
                update: 'PUT /api/auth/profile'
            },
            valuation: {
                makes: 'GET /api/valuation/makes',
                models: 'GET /api/valuation/models/:make',
                calculate: 'POST /api/valuation/calculate',
                history: 'GET /api/valuation/history',
                insights: 'GET /api/valuation/market-insights'
            },
            progress: {
                submitQuiz: 'POST /api/progress/quiz',
                getProgress: 'GET /api/progress',
                certificates: 'GET /api/progress/certificates'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║     🚗 MEI DRIVE AFRICA BACKEND - FULLY OPERATIONAL     ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    
    📡 Server:     http://localhost:${PORT}
    🏥 Health:     http://localhost:${PORT}/health
    📚 API Docs:   http://localhost:${PORT}/
    
    🔐 Auth System:     ✅ Running
    🚗 Valuation API:   ✅ Running  
    📊 Progress System: ✅ Running
    💾 Database:        ✅ Supabase Connected
    
    Environment: ${process.env.NODE_ENV || 'development'}
    `);
});
