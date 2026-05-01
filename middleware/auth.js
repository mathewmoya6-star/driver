const jwt = require('jsonwebtoken');
const { query } = require('../utils/db');

async function authenticate(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
            'SELECT id, email, full_name, role FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            throw new Error();
        }

        req.user = result.rows[0];
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

module.exports = { authenticate, authorize };
