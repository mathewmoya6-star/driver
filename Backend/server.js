// server.js - MEI DRIVE AFRICA (Vercel + Render Ready)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.VERCEL ? 'Vercel' : 'Render/Local',
    node_version: process.version
  });
});

// ==================== API ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MEI DRIVE AFRICA API running 🚀',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/content', (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { title: "Passenger Safety & Etiquette", desc: "Loading procedures, door operation, emergency exits" }
      ],
      bodaModules: [
        { title: "Helmet & Protective Gear", desc: "NTSA approved helmets and safety equipment" }
      ],
      schoolModules: [
        { title: "School Bus Safety Protocol", desc: "Child safety zones and procedures" }
      ],
      academyCourses: [
        { title: "Defensive Driving Course", desc: "Advanced hazard perception" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code", category: "Regulation", downloads: "4.2k" }
      ]
    }
  });
});

// ==================== START SERVER ====================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ==================== VERCEL EXPORT ====================
module.exports = app;
