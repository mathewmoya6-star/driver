const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // 🔥 ADMIN CHECK (simple version)
    if (decoded.email !== "admin@meidrive.com") {
      return res.status(403).json({
        success: false,
        error: "Access denied: Admin only",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};
