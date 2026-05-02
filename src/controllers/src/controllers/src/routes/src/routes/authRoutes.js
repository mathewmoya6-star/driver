const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getCurrentUser, 
    updateProfile,
    changePassword,
    resetPassword,
    logout, 
    deleteAccount 
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);
router.put('/profile', authenticateUser, updateProfile);
router.post('/change-password', authenticateUser, changePassword);
router.post('/logout', authenticateUser, logout);
router.delete('/account', authenticateUser, deleteAccount);

module.exports = router;
