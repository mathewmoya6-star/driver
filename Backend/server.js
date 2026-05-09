// server.js - Main entry point for Vercel and Render
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.VERCEL ? 'Vercel (Serverless)' : 'Development',
    node_version: process.version
  });
});

// ==================== API ROUTES ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MEI DRIVE AFRICA API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/content', (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { title: "Passenger Safety & Etiquette", desc: "Loading procedures, door operation, emergency exits" },
        { title: "Route Compliance", desc: "Licensed PSV routes and NTSA regulations" },
        { title: "Driver Hours Management", desc: "Maximum driving hours and mandatory rest periods" }
      ],
      bodaModules: [
        { title: "Helmet & Protective Gear", desc: "NTSA approved helmets and safety equipment" },
        { title: "Lane Discipline", desc: "Safe filtering, signaling, and positioning" }
      ],
      schoolModules: [
        { title: "School Bus Safety Protocol", desc: "Child safety zones and loading/unloading procedures" },
        { title: "Emergency Response", desc: "Fire, accident, and medical emergency protocols" }
      ],
      academyCourses: [
        { title: "Defensive Driving Course", desc: "Advanced hazard perception and collision avoidance" },
        { title: "Eco-Driving Techniques", desc: "Fuel efficiency and environmental awareness" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code (Official)", category: "Regulation", downloads: "4.2k" },
        { title: "PSV Regulations Guide", category: "Legal", downloads: "2.1k" }
      ]
    }
  });
});

// ==================== FALLBACK ROUTE ====================
// This serves index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// ==================== START SERVER ====================
// Only start server when running directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ MEI DRIVE AFRICA running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
