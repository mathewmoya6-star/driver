require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ======================
// ROUTES (FIXED PATH FOR /src)
// ======================
const authRoutes = require("../routes/auth.routes.js");
const userRoutes = require("../routes/user.routes.js");

// use routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING 🚀");
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
