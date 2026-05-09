const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running",
    timestamp: new Date().toISOString(),
    runtime: process.env.VERCEL ? "vercel" : "render/local"
  });
});

// ================= CONTENT API =================
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { title: "Passenger Safety", desc: "PSV rules & safety" },
        { title: "Route Compliance", desc: "NTSA approved routes" }
      ],
      bodaModules: [
        { title: "Helmet Safety", desc: "Protective gear rules" }
      ],
      schoolModules: [
        { title: "School Transport Safety", desc: "Child safety rules" }
      ],
      academyCourses: [
        { title: "Defensive Driving", desc: "Advanced driving skills" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code", category: "Regulation", downloads: "4.2k" }
      ],
      questions: [
        {
          id: 1,
          text: "What does a red traffic light mean?",
          options: ["Stop", "Go", "Speed up", "Turn left"],
          correct: 0,
          category: "rules"
        }
      ],
      learnerUnits: [
        { id: 1, title: "Road Signs", desc: "Learn all road signs" },
        { id: 2, title: "Traffic Rules", desc: "Basic rules" }
      ]
    }
  });
});

// ================= STATIC FRONTEND (IMPORTANT) =================
const frontendPath = path.join(__dirname, "..", "frontend");

// serve frontend if it exists
app.use(express.static(frontendPath));

// fallback route (must be LAST)
app.get("*", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");

  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        error: "Frontend not found",
        hint: "Ensure frontend/index.html exists"
      });
    }
  });
});

// ================= SERVER START (ONLY FOR RENDER) =================
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
