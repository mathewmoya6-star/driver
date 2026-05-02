const express = require('express');
const router = express.Router();
const { 
    getMakes,
    getModels,
    createValuation, 
    getValuationHistory,
    getValuationById,
    compareValuations,
    getMarketInsights
} = require('../controllers/valuationController');
const { authenticateUser } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/makes', getMakes);
router.get('/models/:make', getModels);
router.get('/market-insights', getMarketInsights);

// Protected routes (auth required)
router.post('/calculate', authenticateUser, createValuation);
router.get('/history', authenticateUser, getValuationHistory);
router.get('/:id', authenticateUser, getValuationById);
router.get('/compare/:valuationId1/:valuationId2', authenticateUser, compareValuations);

module.exports = router;
