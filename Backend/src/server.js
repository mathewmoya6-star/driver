require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());

// =====================
// Environment Variables
// =====================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

// =====================
// Supabase Client
// =====================
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================
// Auth Middleware
// =====================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Auth failed" });
  }
};

// =====================
// Routes
// =====================

// Auth routes (external file)
app.use("/api/auth", require("./auth.routes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    app: "MEI DRIVE AFRICA API 🚀"
  });
});

// Public route
app.get("/api/public", (req, res) => {
  res.json({
    message: "Public route working"
  });
});

// Protected route
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    user: req.user
  });
});

// =====================
// Server Start
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
