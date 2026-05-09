const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
// Optional (Render supports this, Vercel ignores safely)
app.use(express.static(path.join(__dirname)));

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

// ================= CONTENT =================
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { id: 1, title: "Passenger Safety & Etiquette", desc: "Loading, exits, conduct" },
        { id: 2, title: "Route Compliance", desc: "NTSA approved PSV routes" },
        { id: 3, title: "Driver Hours Management", desc: "Rest and fatigue control" }
      ],
      bodaModules: [
        { id: 1, title: "Helmet Safety", desc: "Protective gear standards" },
        { id: 2, title: "Road Discipline", desc: "Lane use and signaling" }
      ],
      schoolModules: [
        { id: 1, title: "School Bus Safety", desc: "Child safety procedures" }
      ],
      academyCourses: [
        { id: 1, title: "Defensive Driving", desc: "Hazard awareness" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code", category: "Regulation", downloads: "4.2k" }
      ]
    }
  });
});

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
  res.json({
    message: "MEI DRIVE AFRICA API is running",
    endpoints: ["/api/health", "/api/content"]
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error", message: err.message });
});

// ================= SERVER START (ONLY RENDER) =================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ================= EXPORT (FOR VERCEL) =================
module.exports = app;
