const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

/* ======================
   CLEAN CORS (PRODUCTION)
====================== */
app.use(cors({
  origin: [
    "https://www.meidriveafrica.com",
    "https://meidriveafrica.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ======================
   SUPABASE (STABLE MODE)
====================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    server: "MEI Drive Africa API",
    time: new Date().toISOString()
  });
});

/* ======================
   AUTH LOGIN
====================== */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    res.json({
      user: data.user,
      session: data.session
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ======================
   PROTECT ROUTE EXAMPLE
====================== */
app.get("/api/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: "Invalid token" });

  res.json(data.user);
});

/* ======================
   FRONTEND ROUTE
====================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
