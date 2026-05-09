const express = require("express");
const supabase = require("./supabase.js");  // Same folder, not parent

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: data.user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      session: data.session,
      user: data.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Logout route
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
