const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = require("../src/middleware/auth");
const role = require("../src/middleware/role");

// PUBLIC ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);

// PROTECTED ROUTE (any logged in user)
router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Profile data",
    user: req.user,
  });
});

// ADMIN ONLY ROUTE
router.get("/admin", auth, role(["admin"]), (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

// DRIVER ONLY ROUTE
router.get("/driver", auth, role(["driver"]), (req, res) => {
  res.json({
    message: "Welcome Driver",
  });
});

module.exports = router;
