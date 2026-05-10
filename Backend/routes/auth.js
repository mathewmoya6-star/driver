const { createClient } = require("@supabase/supabase-js");

// Supabase client (server only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * CORE LOGIN LOGIC (shared)
 */
async function loginHandler(req, res) {
  try {
    const body =
      req.body && typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

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
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

/**
 * 🔥 RENDER + EXPRESS SUPPORT
 * If used in Express app
 */
if (process.env.RUNTIME === "express" || process.env.RENDER) {
  const express = require("express");
  const router = express.Router();

  router.post("/login", loginHandler);

  module.exports = router;
}

/**
 * ⚡ VERCEL SERVERLESS SUPPORT
 * If deployed on Vercel
 */
else {
  module.exports = loginHandler;
}
