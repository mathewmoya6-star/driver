const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API running",
    time: new Date().toISOString()
  });
});

// ================= SUPABASE TEST =================
app.get("/api/supabase-test", async (req, res) => {
  try {
    const supabase = require("./supabase");

    const { data, error } = await supabase
      .from("test")
      .select("*")
      .limit(1);

    res.json({ data, error });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
});

// ================= FRONTEND (IMPORTANT FIX) =================
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});
