const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function connectDB() {
    try {
        await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

async function query(text, params) {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
        console.log(`Slow query (${duration}ms):`, text);
    }
    return result;
}

async function getClient() {
    return await pool.connect();
}

module.exports = { pool, query, getClient, connectDB };
