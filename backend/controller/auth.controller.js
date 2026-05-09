const supabase = require("../config/supabase");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE USER
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ROLE (PROMOTE USER)
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "User role updated",
      user: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DASHBOARD STATS
exports.getStats = async (req, res) => {
  try {
    const { data: users } = await supabase
      .from("users")
      .select("*");

    const total = users.length;
    const admins = users.filter(u => u.role === "admin").length;
    const drivers = users.filter(u => u.role === "driver").length;
    const students = users.filter(u => u.role === "student").length;

    res.json({
      totalUsers: total,
      admins,
      drivers,
      students,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
