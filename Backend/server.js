require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =========================
 * SAFE WEBSOCKET IMPORT
 * =========================
 */
let WebSocket;

try {
  WebSocket = require("ws");
} catch (err) {
  console.log("ws not installed - skipping websocket feature");
}

/**
 * =========================
 * STATIC FRONTEND
 * =========================
 */
app.use(express.static(path.join(__dirname, "frontend")));

/**
 * =========================
 * ROUTES
 * =========================
 */

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// AI routes (if you have it)
if (require("fs").existsSync("./routes/ai.js")) {
  app.use("/api/ai", require("./routes/ai"));
}

/**
 * =========================
 * HOME ROUTE
 * =========================
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/**
 * =========================
 * OPTIONAL WEBSOCKET SERVER
 * (only if ws is installed)
 * =========================
 */
if (WebSocket) {
  const http = require("http");
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
      console.log("WS message:", message.toString());
    });

    ws.send("Connected to MEI DRIVE WebSocket");
  });

  const PORT = process.env.PORT || 10000;

  server.listen(PORT, () => {
    console.log("Server running with WebSocket on port", PORT);
  });

} else {
  /**
   * =========================
   * NORMAL EXPRESS SERVER
   * =========================
   */
  const PORT = process.env.PORT || 10000;

  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}
