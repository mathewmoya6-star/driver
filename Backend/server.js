require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/**
 * Middleware
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
 * Home Route
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
