const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth.routes");

// API routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API is running",
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA BACKEND RUNNING 🚀");
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global error handler (important for production)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
