const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ======================================================
   SUPABASE (REAL PRODUCTION SAFE CONFIG)
====================================================== */
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      disabled: true
    }
  }
);

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */
async function authenticateUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = data.user;
    next();
  } catch {
    res.status(500).json({ error: "Auth error" });
  }
}

async function requireAdmin(req, res, next) {
  await authenticateUser(req, res, () => {
    const role = req.user.user_metadata?.role;
    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("units").select("*", { count: "exact", head: true });

    res.json({
      status: "ok",
      database: error ? "error" : "connected",
      time: new Date().toISOString()
    });
  } catch (err) {
    res.json({ status: "ok", database: "error", message: err.message });
  }
});

/* ======================================================
   AUTH
====================================================== */
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, role = "learner" } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (error) throw error;

    await supabaseAdmin.from("user_profiles").insert({
      user_id: data.user.id,
      name,
      email,
      role,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, user: data.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/* ======================================================
   CONTENT
====================================================== */
app.get("/api/content/units", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("units")
    .select("*, lessons(*)")
    .order("order_number");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

/* ======================================================
   EXAM ENGINE (UNCHANGED CORE LOGIC)
====================================================== */
app.post("/api/exam/generate", authenticateUser, async (req, res) => {
  const { mode, category, questionCount } = req.body;

  try {
    let query = supabaseAdmin.from("questions").select("*");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: allQuestions, error } = await query;
    if (error) throw error;

    const count = questionCount || 20;

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("exam_sessions")
      .insert({
        user_id: req.user.id,
        mode,
        questions: selected,
        start_time: new Date().toISOString(),
        status: "in_progress"
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    res.json({
      session_id: session.id,
      questions: selected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ADMIN
====================================================== */
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const { count } = await supabaseAdmin.from("user_profiles").select("*", { count: "exact", head: true });

  res.json({
    users: count || 0
  });
});

/* ======================================================
   FRONTEND
====================================================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
