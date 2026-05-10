const { createClient } = require("@supabase/supabase-js");

// SAFE ENV CHECK (prevents crash)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

module.exports = async (req, res) => {
  try {
    // Only POST allowed
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // SAFE BODY PARSING (Vercel-safe)
    let body = req.body;

    if (!body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
    });

  } catch (err) {
    console.error("LOGIN CRASH:", err);

    return res.status(500).json({
      error: "Server error",
      details: err.message, // helps debugging in Vercel logs
    });
  }
};
