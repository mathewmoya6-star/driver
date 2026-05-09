// server.js - Works on Vercel and Render
const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'Vercel' : 'Render'
  });
});

// API endpoint for content
app.get('/api/content', (req, res) => {
  res.json({
    content: {
      psvModules: [
        { title: "Passenger Safety", desc: "Loading procedures and emergency exits" }
      ],
      bodaModules: [
        { title: "Helmet Safety", desc: "NTSA approved helmets" }
      ],
      schoolModules: [
        { title: "School Bus Safety", desc: "Child safety protocols" }
      ],
      academyCourses: [
        { title: "Defensive Driving", desc: "Advanced techniques" }
      ],
      libraryDocs: [
        { title: "Highway Code", category: "Official", downloads: "4.2k" }
      ]
    }
  });
});

// IMPORTANT: This must be the LAST route - serves index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel serverless
module.exports = app;

// Only start server if running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
