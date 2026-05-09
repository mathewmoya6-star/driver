const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK (RENDER + TESTING)
========================= */
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    time: new Date().toISOString()
  });
});

/* =========================
   SAMPLE API ROUTES
   (replace later with real Supabase logic)
========================= */

// Get learning content (placeholder)
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    message: "Content API working",
    data: []
  });
});

// User progress (placeholder)
app.get("/api/progress/:userId", (req, res) => {
  res.json({
    success: true,
    userId: req.params.userId,
    progress: {}
  });
});

// Save progress (placeholder)
app.post("/api/progress", (req, res) => {
  res.json({
    success: true,
    message: "Progress saved",
    data: req.body
  });
});

/* =========================
   AUTH ROUTES (PLACEHOLDER)
========================= */
app.post("/api/login", (req, res) => {
  const { email } = req.body;

  res.json({
    success: true,
    user: {
      id: "123",
      name: "Demo User",
      email
    }
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`SERVER RUNNING ON http://localhost:${PORT}`);
  console.log("========================================");
});
