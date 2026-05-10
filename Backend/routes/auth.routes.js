const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/login", async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required",
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      {
        id: data.user.id,
        email: data.user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ✅ RESPONSE
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
