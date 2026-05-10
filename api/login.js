const { createClient } = require("@supabase/supabase-js");

// Supabase (SERVER ONLY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Safe body parsing
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { email, password } = body || {};

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    // Success response
    return res.status(200).json({
      user: data.user,
      session: data.session
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};
