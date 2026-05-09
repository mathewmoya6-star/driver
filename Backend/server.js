const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROOT PATH FIX =================
const ROOT_DIR = __dirname;

// ================= FRONTEND PATH =================
// IMPORTANT: your frontend folder MUST exist in Backend/frontend
const FRONTEND_PATH = path.join(ROOT_DIR, "frontend");

// Serve frontend static files
app.use(express.static(FRONTEND_PATH));

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running",
    time: new Date().toISOString(),
  });
});

// ================= CONTENT API =================
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    content: {
      psvModules: [
        { title: "Passenger Safety", desc: "PSV rules & safety" },
        { title: "Route Compliance", desc: "NTSA approved routes" },
      ],
      bodaModules: [
        { title: "Helmet Safety", desc: "Boda boda safety rules" },
      ],
      schoolModules: [
        { title: "School Transport Safety", desc: "Child safety rules" },
      ],
      academyCourses: [
        { title: "Defensive Driving", desc: "Advanced driving skills" },
      ],
      libraryDocs: [
        { title: "Kenya Highway Code", category: "Regulation", downloads: "4.2k" },
      ],
    },
  });
});

// ================= FRONTEND ENTRY =================
// FIX: always load index.html from frontend folder
app.get("/", (req, res) => {
  const file = path.join(FRONTEND_PATH, "index.html");
  res.sendFile(file);
});

// ================= CATCH ALL =================
app.get("*", (req, res) => {
  const file = path.join(FRONTEND_PATH, "index.html");

  res.sendFile(file, (err) => {
    if (err) {
      res.status(404).json({
        error: "Frontend not found",
        hint: "Ensure frontend/index.html exists",
        path: file,
      });
    }
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
  });
});

module.exports = app;
