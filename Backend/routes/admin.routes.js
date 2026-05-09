const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const adminController = require("../controllers/admin.controller");

// ALL ADMIN ROUTES PROTECTED
router.use(auth);
router.use(role(["admin"]));

// USERS
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUser);
router.delete("/users/:id", adminController.deleteUser);

// ROLE MANAGEMENT
router.put("/users/:id/role", adminController.updateRole);

// DASHBOARD
router.get("/stats", adminController.getStats);

module.exports = router;
