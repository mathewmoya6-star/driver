const { createClient } = require("@supabase/supabase-js");

// Supabase client (SERVER ONLY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  try {
    // Only POST allowed
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 🔥 IMPORTANT FIX: parse body safely
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      error: "Server crashed - check logs"
    });
  }
};
