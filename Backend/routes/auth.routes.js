const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// ======================
// REGISTER USER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: data.user
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

// ======================
// LOGIN USER
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

// ======================
// LOGOUT USER
// ======================
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Logout successful"
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

module.exports = router;
