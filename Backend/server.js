const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ================= API ROUTES =================
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "MEI DRIVE AFRICA API running" });
});

app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    content: {
      message: "Content loaded"
    }
  });
});

// ================= FRONTEND =================
// IMPORTANT: Vercel needs absolute safe path
app.use(express.static(path.join(__dirname, "frontend")));

// SPA fallback (IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ================= EXPORT =================
module.exports = app;
