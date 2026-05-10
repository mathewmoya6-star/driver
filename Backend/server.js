const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// ================= SUPABASE (SERVER ONLY) =================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= AUTH MIDDLEWARE =================
async function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const role = data.user.user_metadata?.role;

    if (role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth error" });
  }
}

// ================= AUTH =================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ================= ADMIN API =================
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const { data } = await supabase.from("user_progress").select("*");

  const totalUsers = new Set(data?.map(u => u.user_id)).size;

  res.json({ totalUsers, raw: data });
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.post("/api/admin/users", requireAdmin, async (req, res) => {
  const { user_id } = req.body;

  const { error } = await supabase.from("user_progress").insert({
    user_id,
    progress_data: { units: {} },
    updated_at: new Date(),
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ success: true });
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ success: true });
});

// ================= FRONTEND =================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
