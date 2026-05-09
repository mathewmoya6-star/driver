const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= FRONTEND SERVING =================
// This fixes your 404 on "/"
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ================= API ROUTES =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { id: 1, title: "Passenger Safety & Etiquette", desc: "Loading, exits, conduct" },
        { id: 2, title: "Route Compliance", desc: "NTSA regulations" },
        { id: 3, title: "Driver Hours Management", desc: "Rest periods & fatigue control" }
      ],
      bodaModules: [
        { id: 1, title: "Helmet Safety", desc: "Protective gear standards" },
        { id: 2, title: "Road Discipline", desc: "Lane use & signaling" }
      ],
      schoolModules: [
        { id: 1, title: "School Bus Safety", desc: "Child safety procedures" }
      ],
      academyCourses: [
        { id: 1, title: "Defensive Driving", desc: "Hazard awareness training" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code", category: "Regulation", downloads: "4.2k" }
      ]
    }
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// ================= SERVER (Render ONLY) =================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ================= EXPORT (Vercel) =================
module.exports = app;
