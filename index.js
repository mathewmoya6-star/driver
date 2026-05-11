const app = require("../server");

// Handle any startup errors
if (!app) {
  const express = require('express');
  const fallback = express();
  fallback.get('*', (req, res) => {
    res.status(500).json({ error: "Server failed to load" });
  });
  module.exports = fallback;
} else {
  module.exports = app;
}
