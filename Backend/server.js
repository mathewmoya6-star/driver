import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// SAFE INIT (prevents crash)
function supabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log("ENV ERROR:", {
      url: process.env.SUPABASE_URL,
      key: !!process.env.SUPABASE_ANON_KEY,
    });

    throw new Error("Missing Supabase environment variables");
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// TEST ROUTE (debug)
app.get("/", (req, res) => {
  res.json({
    status: "Server running",
    supabase_url: !!process.env.SUPABASE_URL,
    supabase_key: !!process.env.SUPABASE_ANON_KEY,
  });
});

// LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  try {
    const supabase = supabaseClient();

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
