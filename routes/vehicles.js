const express = require('express');
const { query } = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Vehicle valuation endpoint
router.post('/valuate', authenticate, async (req, res) => {
    const { make, model, year, mileage, condition, location } = req.body;

    try {
        // Get base price from database
        const vehicleResult = await query(
            'SELECT average_price, price_min, price_max FROM vehicles WHERE make = $1 AND model = $2',
            [make, model]
        );

        let basePrice = 2000000;
        let priceMin = 1500000;
        let priceMax = 2500000;

        if (vehicleResult.rows.length > 0) {
            basePrice = vehicleResult.rows[0].average_price;
            priceMin = vehicleResult.rows[0].price_min;
            priceMax = vehicleResult.rows[0].price_max;
        }

        // Calculate adjustments
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        const yearAdjustment = -age * 150000;
        
        const mileageAdjustment = -Math.floor(mileage / 10000) * 30000;
        
        const conditionMultipliers = {
            'excellent': 1.12,
            'verygood': 1.05,
            'good': 1.0,
            'fair': 0.88,
            'poor': 0.75
        };
        const conditionAdjustment = basePrice * (conditionMultipliers[condition] - 1);

        const locationMultipliers = {
            'nairobi': 1.08,
            'mombasa': 0.96,
            'kisumu': 0.94,
            'nakuru': 0.98,
            'eldoret': 0.95
        };
        const locationAdjustment = basePrice * (locationMultipliers[location] - 1);

        let finalValue = basePrice + yearAdjustment + mileageAdjustment + conditionAdjustment + locationAdjustment;
        finalValue = Math.max(finalValue, 250000);
        finalValue = Math.min(finalValue, 8000000);

        // Calculate confidence score
        let confidence = 90 - Math.floor(age / 2);
        if (condition === 'excellent') confidence += 5;
        if (mileage > 150000) confidence -= 10;
        confidence = Math.min(98, Math.max(65, confidence));

        // Save valuation history
        await query(
            `INSERT INTO vehicle_valuations (user_id, make, model, year, mileage, condition, location, value, confidence)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [req.user.id, make, model, year, mileage, condition, location, finalValue, confidence]
        );

        res.json({
            value: finalValue,
            price_range: { min: priceMin, max: priceMax },
            confidence,
            adjustments: {
                year: yearAdjustment,
                mileage: mileageAdjustment,
                condition: conditionAdjustment,
                location: locationAdjustment
            },
            market_trend: age < 3 ? '📈 Appreciating' : age < 7 ? '📉 Depreciating' : '⚖️ Stable'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Valuation failed' });
    }
});

// Get valuation history
router.get('/history', authenticate, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM vehicle_valuations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
