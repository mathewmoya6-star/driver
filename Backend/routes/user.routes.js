const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// AUTH MIDDLEWARE
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = data.user;
  next();
};

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  res.json({
    user: req.user,
    profile: data,
  });
});

module.exports = router;
