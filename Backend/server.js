const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

// App setup
const app = express();
app.use(cors());
app.use(express.json());

// Supabase client (Realtime disabled to avoid WebSocket crash)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      enabled: false
    }
  }
);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "MEI Drive Africa API running 🚀",
    status: "OK"
  });
});

// Example: Get users
app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Example: Create user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start server (Render compatible)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
