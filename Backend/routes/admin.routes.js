const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

router.get(
  "/admin",
  auth,
  roles(["admin"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
      user: req.user
    });
  }
);

module.exports = router;
