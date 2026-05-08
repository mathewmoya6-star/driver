const express = require("express");

const app = express();

// Home route
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "MEI DRIVE AFRICA"
  });
});

// Render port
const PORT = process.env.PORT || 10000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
