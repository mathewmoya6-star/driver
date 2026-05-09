const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// ROUTES
// =====================
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

// Auth routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running properly",
  });
});

// =====================
// 404 HANDLER
// =====================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// =====================
// GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
