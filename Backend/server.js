const express = require("express");
const cors = require("cors");
const path = require("path");
const ws = require("ws");

global.WebSocket = ws;

const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();

/* =========================================
   CORS
========================================= */
app.use(cors({
  origin: [
    "https://www.meidriveafrica.com",
    "https://meidriveafrica.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

/* =========================================
   STATIC FILES
========================================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   SUPABASE CLIENT
========================================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/* =========================================
   HEALTH CHECK
========================================= */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI Drive Africa Backend Running 🚀"
  });
});

/* =========================================
   LOGIN
========================================= */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      return res.status(401).json({
        error: error.message
      });
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

/* =========================================
   AUTH TEST
========================================= */
app.get("/api/me", async (req, res) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No token provided"
      });
    }

    const { data, error } =
      await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }

    res.json(data.user);

  } catch (err) {
    res.status(500).json({
      error: "Auth error"
    });
  }
});

/* =========================================
   FRONTEND
========================================= */
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/* =========================================
   START SERVER
========================================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
