const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get admin stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get users by role
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    const { data: drivers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "driver");

    const { data: students } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "user");

    res.json({
      totalUsers: totalUsers || 0,
      admins: admins?.length || 0,
      drivers: drivers?.length || 0,
      students: students?.length || 0,
      completionRate: 75
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (excluding admins)
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ users: users || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put("/users/:id/role", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "User role updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user status
router.post("/users/:id/toggle", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const { data: user } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !user?.is_active })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "User status toggled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from auth users (this requires admin privileges)
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) throw error;

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
