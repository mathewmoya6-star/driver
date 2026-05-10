require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/**
 * Middleware (ALWAYS FIRST)
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Safe WebSocket Import
 */
let WebSocket;

try {
  WebSocket = require("ws");
} catch (err) {
  console.log("ws not installed - skipping websocket");
}

/**
 * Static Frontend
 */
app.use(express.static(path.join(__dirname, "frontend")));

/**
 * Routes
 */
app.use("/api/auth", require("./routes/auth.routes"));

/**
 * Middleware import AFTER setup
 */
const adminAuth = require("./middleware/admin");

/**
 * Admin Route
 */
app.get("/api/admin", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin Panel",
    user: req.user,
  });
});

/**
 * Home Route
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("SERVER IS RUNNING!");
  console.log(`http://localhost:${PORT}`);
  console.log("========================================");
});
