const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    token: data.session.access_token,
    user: data.user
  });
});

module.exports = router;
