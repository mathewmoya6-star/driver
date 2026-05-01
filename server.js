const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { pool, connectDB } = require('./utils/db');
const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const vehiclesRoutes = require('./routes/vehicles');
const fleetRoutes = require('./routes/fleet');
const insuranceRoutes = require('./routes/insurance');
const progressRoutes = require('./routes/progress');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'https://meidriveafrica.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date(), environment: process.env.NODE_ENV });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 MEI DRIVE AFRICA API running on port ${PORT}`);
});
