let app;

try {
  app = require("../server");
} catch (err) {
  console.error("Server failed to load:", err);

  module.exports = (req, res) => {
    return res.status(500).json({
      error: "Server crash on startup",
      message: err.message,
    });
  };

  return;
}

module.exports = (req, res) => {
  return app(req, res);
};
