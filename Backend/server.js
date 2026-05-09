const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ================= API =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running"
  });
});

// ================= FRONTEND PATH =================
const frontendPath = path.join(__dirname, "frontend");

// Serve static frontend files
app.use(express.static(frontendPath));

// HOME ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
