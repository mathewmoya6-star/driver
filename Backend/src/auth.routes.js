const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// public
router.post("/register", authController.register);
router.post("/login", authController.login);

// protected
router.get("/profile", auth, (req, res) => {
  res.json(req.user);
});

// admin only
router.get("/admin", auth, role(["admin"]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

// driver only
router.get("/driver", auth, role(["driver"]), (req, res) => {
  res.json({ message: "Driver access granted" });
});

module.exports = router;
