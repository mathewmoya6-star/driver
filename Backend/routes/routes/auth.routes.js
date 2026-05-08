const express = require("express");
const router = express.Router();

// TEST LOGIN ROUTE
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password required"
    });
  }

  res.json({
    message: "Login route working",
    user: { email }
  });
});

module.exports = router;
