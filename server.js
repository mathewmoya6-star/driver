const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API Running"
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render uses dynamic PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
