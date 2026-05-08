const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "MEI DRIVE AFRICA",
    message: "System running successfully"
  });
});

// Render port
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("MEI DRIVE AFRICA running on port " + PORT);
});
