const express = require("express");
const router = express.Router();

const supabase = require("../supabase.js");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
